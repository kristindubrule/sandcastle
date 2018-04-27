import { Component, OnInit } from '@angular/core';
import { HttpService } from '../http.service';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  newtask: any;
  inputs = {};
  ioConnection: any;

  constructor(private _httpService: HttpService) { }

  ngOnInit() {
    this._httpService.setPage('list');
    this.initIoConnection();
    this.reset();
    this.getTasks();
  }
  
  private initIoConnection(): void {
    this._httpService.initSocket();

    this.ioConnection = this._httpService.onEvent()
      .subscribe(() => {
        this.getTasks();
    });
  }

  reset() {
    this.newtask = { taskText: '' };
  }

  getTasks() {
    let obs = this._httpService.getTasks();
    obs.subscribe( data => {
      this.inputs = {};
      for (let task of data['tasks']) {
        this.inputs[task._id] = task;
      }
    });
  }

  addTask() {
    let obs = this._httpService.addTask(this.newtask);
    obs.subscribe( data => {
      if (data['errors']) {
        console.log(data['errors']);
      } else {
        this.getTasks();
        this.reset();
      }
    });
  }

  deleteTask(taskId : string) {
    let obs = this._httpService.deleteTask(taskId);
    obs.subscribe( data => {
      this.getTasks();
    });
  }

  updateTask(tid: string) {
    let obs = this._httpService.updateTask(this.inputs[tid]);
    obs.subscribe( data => {
      this.getTasks();
    })
  }

  updateTaskDetails(updateObj) {
    console.log(updateObj);
    let task = this.inputs[updateObj.id];
    task[updateObj.editfield] = updateObj.value;
    this.inputs[updateObj.id] = task;
    this.updateTask(updateObj.id);

  }

  objectKeys(obj) {
    return Object.keys(obj);
  }

  toggleStatus(taskId: string) {
    let task = this.inputs[taskId];
    task.status = ((task.status == 'Done') ? 'Not done' : 'Done');
    this.updateTask(taskId);
  }
}