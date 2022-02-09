import { Component, OnInit } from '@angular/core';
import { Command } from '@tauri-apps/api/shell'
// alternatively, use `window.__TAURI__.shell.Command`
// `my-sidecar` is the value specified on `tauri.conf.json > tauri > bundle > externalBin`

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  out = '';

  constructor() { }

  ngOnInit(): void {
  }

  async run(){
    const command = Command.sidecar('my-sidecar')
    const output = await command.execute()
    this.out = output.stdout
  }
}
