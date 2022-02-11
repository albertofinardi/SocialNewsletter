import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { dialog, fs, http } from '@tauri-apps/api';
import { environment } from 'src/environments/environment';

import { TweetQuery } from './core/twitter_manager';


@Component({
  selector: 'app-twitter',
  templateUrl: './twitter.component.html',
  styleUrls: ['./twitter.component.css']
})
export class TwitterComponent {

  log = 'Nothing to see...'
  error = ''
  fetching = false
  percentage = 0;

  twitterSettings = new FormGroup({
    bearer_token: new FormControl(environment.bearer, Validators.required),
    max_tweets: new FormControl(500, Validators.min(10)),
    min_likes: new FormControl(0, Validators.required),
    max_added_or_fetched: new FormControl('fetched'),
    query: new FormControl(environment.query, Validators.required),
    days_span: new FormControl(1, Validators.required),
    export_csv: new FormControl('data', Validators.required),
    export_json: new FormControl('data', Validators.required),
    backup_folder: new FormControl('backup'),
    export_csv_backup: new FormControl('data_backup'),
    export_json_backup: new FormControl('data_backup'),
  });

  async onSubmit() {
    let tweetQuery = new TweetQuery()
    tweetQuery = this.twitterSettings.value;
    this.error = ''
    try {
      let result = await this.getData(tweetQuery);
      dialog.save({filters: [{extensions: ['json'], name: 'jsonFilter'}]}).then(path => {
        fs.writeFile({
          path: path,
          contents: result!
        })
      })
      this.error = ''
    } catch (err: any) {
      this.error = err
    }
  }

  async loadProfile() {
    let file;
    dialog.open({filters: [{extensions: ['social'], name: 'socialFilter'}]}).then(async path => {
      file = await fs.readTextFile(path.toString())
      let json = JSON.parse(file)

      Object.keys(this.twitterSettings.controls).forEach(key => {
        this.twitterSettings.controls[key].setValue(json[key])
        if (key == 'max_tweets' || key == 'min_likes' || key == 'days_span') {
          this.twitterSettings.controls[key].setValue(parseInt(json[key]))
        }

      });
    })

  }

  async saveProfile() {
    let profile = JSON.stringify(this.twitterSettings.getRawValue());
    dialog.save({filters: [{extensions: ['social'], name: 'socialFilter'}]}).then(path => {
      fs.writeFile({
        path: path,
        contents: profile
      })
    })
  }

  async backupFolder() {
    dialog.open({
      directory: true,
      multiple: false,
    }).then(async path => {
      this.twitterSettings.controls['backup_folder'].setValue(path)
    })
  }

  open(content: TemplateRef<any>) {
    this.modalService.open(content, {
      ariaLabelledBy: 'Output',
      size: 'xl',
      keyboard: !this.fetching,
      backdrop: this.fetching ? 'static' : true
    })
  }

  constructor(private modalService: NgbModal) { }

  async getData(twq: TweetQuery) {

    async function fetchData(twq: TweetQuery, max_results: number, today: string, start: string, next_token: string | null): Promise<http.Response<any>> {

      var headers = "Bearer " + twq.bearer_token
      var url = "https://api.twitter.com/2/tweets/search/recent?query=" + twq.query + "&start_time=" + start + "&end_time=" + today + "&max_results=" + max_results.toString() + "&tweet.fields=id,text,author_id,created_at,public_metrics&expansions=author_id&user.fields=id,name,username,public_metrics";
      if (next_token != null) {
        url += "&next_token=" + next_token;
      }
      return http.fetch(encodeURI(url), {
        method: "GET", headers: {
          "Authorization": headers.toString(),
        }
      })

    }

    const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

    function filterLike(tweet: any) {
      return tweet.public_metrics.like_count >= twq.min_likes;
    }

    function exportData(users: any[], filtered: any[]) {
      var resultObj: any[] = [];

      filtered.forEach((element: any) => {
        const user = users.find(x => x.id === element.author_id)
        const tweet = {
          tweet: element,
          user: user
        }
        resultObj.push(tweet)
      });
      return JSON.stringify(resultObj);
    }

    const max_results = 100;
    const today = new Date(Date.now() - 30000)
    const start = new Date(new Date().setDate(today.getDate() - twq.days_span) - 30000)
    const terminalWindow = document.getElementById("terminal");

    var data: any[] = []
    var users: any[] = []

    var total_tweets = 0;
    var total_tweets_added = 0;
    var flag = true;
    var next_token = null
    var result_count = 0;
    this.percentage = 0
    this.log = ''
    this.fetching = true;
  

    while (flag && this.fetching) {
      if (twq.max_added_or_fetched == 'fetched' && total_tweets >= twq.max_tweets) {
        break;
      } else if (twq.max_added_or_fetched == 'added' && total_tweets_added >= twq.max_tweets) {
        break;
      }
      this.log += "-------------------<br>Token: " + next_token
      var res: any = await fetchData(twq, max_results, today.toISOString(), start.toISOString(), next_token);

      /* Se ci sono errori nella richiesta esce prima */
      if (res.ok == false) {
        var texts = res.data.errors.map((el: any) => el.message);
        this.error = texts;
        this.log = texts;
        this.fetching = false;
        break;
      }

      result_count = res.data.meta.result_count;
      var filtered = res.data.data.filter(filterLike)

      data = data.concat(filtered)

      /* TODO Rimuovere utenti già eslusi post filter like */
      users = users.concat(res.data.includes.users)

      if (res.data.meta.next_token != null && res.data.meta.next_token != "") {
        next_token = res.data.meta.next_token
        this.log += "<br>Next Token: " + next_token;
        if (result_count != null && result_count > 0 && next_token != null) {
          total_tweets_added += filtered.length
          total_tweets += result_count
          this.log += "<br>-------------------<br>Total # of Tweets fetched: " + total_tweets + "<br>Total # of Tweets added: " + total_tweets_added + "<br>-------------------"
          if (twq.max_added_or_fetched == 'fetched') {
            this.percentage = total_tweets / twq.max_tweets * 100;
          }
          if (twq.max_added_or_fetched == 'added') {
            this.percentage = total_tweets_added / twq.max_tweets * 100;
          }
          await sleep(5000)
        }
      } else {
        if (result_count != null && result_count > 0) {
          total_tweets_added += filtered.length
          total_tweets += result_count
          this.log += "<br>-------------------<br>Total # of Tweets fetched: " + total_tweets + "<br>Total # of Tweets added: " + total_tweets_added + "<br>-------------------"
          if (twq.max_added_or_fetched == 'fetched') {
            this.percentage = total_tweets / twq.max_tweets * 100;
          }
          if (twq.max_added_or_fetched == 'added') {
            this.percentage = total_tweets_added / twq.max_tweets * 100;
          }
          await sleep(5000)
        }
        flag = false
        next_token = ""
      }
      await sleep(5000)

    }
    this.fetching = false;
    this.log += "<br><br>Total number of fetched: " + total_tweets + "<br>Total number of added: " + total_tweets_added
    this.percentage = 100;
    return exportData(users, filtered)
  }


}
