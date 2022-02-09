import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { TweetQuery, start } from './core/twitter_manager';


@Component({
  selector: 'app-twitter',
  templateUrl: './twitter.component.html',
  styleUrls: ['./twitter.component.css']
})
export class TwitterComponent implements OnInit {

  twitterSettings = new FormGroup({
    bearer_token: new FormControl('', Validators.required),
    max_tweets: new FormControl(500),
    min_likes: new FormControl(0, Validators.required),
    max_added_or_fetched: new FormControl('fetched'),
    query: new FormControl(''),
    days_span: new FormControl(1, Validators.required),
    export_csv: new FormControl('data', Validators.required),
    export_json: new FormControl('data', Validators.required),
    backup_folder: new FormControl('backup'),
    export_csv_backup: new FormControl('data_backup'),
    export_json_backup: new FormControl('data_backup'),
  });

  async onSubmit(){
    let tweetQuery = new TweetQuery()
    tweetQuery = this.twitterSettings.value;
    const res = await start(tweetQuery);
    console.log(res);
  }
/*
  async loadProfile(){
    let file;
    dialog.open().then(async path => {
      file = await fs.readTextFile(path.toString())
      let json = JSON.parse(file)
      
      Object.keys(this.twitterSettings.controls).forEach(key => {
        this.twitterSettings.controls[key].setValue(json[key])
        if(key == 'max_tweets' || key == 'min_likes' || key == 'days_span'){
          this.twitterSettings.controls[key].setValue(parseInt(json[key]))
        }

      });
    })

  }

  async saveProfile(){
    let profile = JSON.stringify(this.twitterSettings.getRawValue());
    dialog.save({
      filters: [{extensions: ['social'], name: 'social'}],
    }).then(path => {
      fs.writeFile({
        path: path,
        contents: profile
      })
    })
  }

  async backupFolder(){
    dialog.open({
      directory: true,
      multiple: false,
    }).then(async path => {
      this.twitterSettings.controls['backup_folder'].setValue(path)
    })
  }
*/
  constructor() { }

  ngOnInit(): void {
  }

  

}
