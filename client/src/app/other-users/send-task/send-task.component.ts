import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../http.service';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-send-task',
  templateUrl: './send-task.component.html',
  styleUrls: ['./send-task.component.css']
})
export class SendTaskComponent implements OnInit {
  users: any;
  newtask = { taskText: '', _user: '' };
  message: any;

  constructor(
    private _httpService: HttpService,
    private _route: ActivatedRoute,
    private _router: Router
  ) { }

  ngOnInit() {
    this.getUsers();
  }

  getUsers() {
    let obs = this._httpService.getUsers();
    obs.subscribe( data => {
      if (data['errors']) {
        console.log(data['errors']);
      } else {
        this.users = data['users'];
      }
    });
  }

  reset() {
    this.newtask = { taskText: '', _user: '' };
  }

  sendTask() {
    console.log('Adding task');
    console.log(this.newtask);
    let obs = this._httpService.sendTask(this.newtask);
    obs.subscribe( data => {
      if (data['errors']) {
        console.log(data['errors']);
      } else {
        this._httpService.pushTaskUpdate(this.newtask._user);
        this.reset();
        this.message = 'Task sent successfully';
      }
    });

  }
}
