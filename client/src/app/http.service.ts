import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class HttpService {
  user = "5ade4d53817af8773d2db5ae";

  constructor(private _http: HttpClient) { }

  getTasks() {
    return this._http.get('/users/' + this.user + '/task');
  }

  addTask(task: any) {
    return this._http.post('/users/' + this.user + '/task', task);
  }

  deleteTask(taskId : string) {
    return this._http.delete('/users/' + this.user + '/task/' + taskId);
  }

  updateTask(task: any) {
    return this._http.put('/users/' + this.user + '/task/' + task._id, task);
  }
}
