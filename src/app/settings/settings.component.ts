import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { dialog, fs } from '@tauri-apps/api';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  generalSettings  = new FormGroup({
    twitter_default: new FormControl(''),
    reddit_default: new FormControl('')
  })

  async setProfile(key : string){
    dialog.open({
      directory: false,
      multiple: false,
    }).then(async path => {
      this.generalSettings.controls[key].setValue(path)
    })
  }

  async loadProfile(){
    /* il problema è trovare il path corrente */
  }

  constructor() { 
    this.loadProfile()
  }

  ngOnInit(): void {
  }

}
