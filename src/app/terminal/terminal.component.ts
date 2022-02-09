import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.css']
})
export class TerminalComponent implements OnInit {

  log = 'Ciao Ciao Ciao Ciao Ciao Ciao Ciao Ciao Ciao Ciao Ciao Ciao Ciao Ciao Ciao Ciao Ciao Ciao Ciao Ciao Ciao Ciao Ciao Ciao Ciao Ciao Ciao Ciao Ciao Ciao Ciao Ciao Ciao Ciao'

  constructor() { }

  ngOnInit(): void {
  }

}
