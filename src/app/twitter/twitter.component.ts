import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { dialog, fs } from '@tauri-apps/api';

import { TweetQuery, go } from './core/twitter_manager';


@Component({
  selector: 'app-twitter',
  templateUrl: './twitter.component.html',
  styleUrls: ['./twitter.component.css']
})
export class TwitterComponent {

  error = ''

  twitterSettings = new FormGroup({
    bearer_token: new FormControl('AAAAAAAAAAAAAAAAAAAAALO0YQEAAAAA0DVeZeNa0gvvIMyz1oupExmLSwY%3DkueA2JTVEFh44CwPG5Xfu7grxCx0G7MPMYNWkugbHVn7Ts6NnI', Validators.required),
    max_tweets: new FormControl(500),
    min_likes: new FormControl(0, Validators.required),
    max_added_or_fetched: new FormControl('fetched'),
    query: new FormControl('a'),
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
    this.error = 'Loading...'
    try {
      await go(tweetQuery);
    } catch (err: any) {
      this.error = err
    }
    /*startA(tweetQuery).then((res: any) => {
      if (res.ok == false) {
        this.error = res.data.detail.toString()
      } else {
        this.error = ''
      }
      console.log(res)
    }).catch(err => {
      this.error = err
    })*/
  }

  async loadProfile() {
    let file;
    dialog.open().then(async path => {
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
    dialog.save({
      filters: [{ extensions: ['social'], name: 'social' }],
    }).then(path => {
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

  constructor() { }



}
