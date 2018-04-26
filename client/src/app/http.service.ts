import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { AuthenticationService } from './authentication.service';
import * as io from 'socket.io-client';
import { map } from 'rxjs/operators/map';

const SERVER_URL = 'http://localhost:8000';

@Injectable()
export class HttpService {
  // user = "5ae0f30707289380fe17d6ad";
  private socket: SocketIOClient.Socket; // The client instance of socket.io

  constructor(private _http: HttpClient, private auth: AuthenticationService) { 
    // this.socket.on('tasks_updated', function(){
    //   console.log('tasks updated');
    // });
  }

  public initSocket(): void {
    this.socket = io.connect(SERVER_URL, {query: 'token=' + this.auth.getToken()});
    //this.socket = io.connect(SERVER_URL);
    this.socket.on('connect', function () {
      console.log('socket authenticated');
    }).on('disconnect', function () {
      console.log('socket disconnected');
    });
  }

  public onEvent(): Observable<any> {
    return new Observable<any>(observer => {
        this.socket.on('tasks_updated', () => {
          observer.next();
        });
    });
  }

  getTasks() {
    return this._http.get('/api/users/' + this.auth.getUserDetails()._id + '/task', { headers: { Authorization: `Bearer ${this.auth.getToken()}` } } );
  }

  addTask(task: any) {
    return this._http.post('/api/users/' + this.auth.getUserDetails()._id + '/task', task, { headers: { Authorization: `Bearer ${this.auth.getToken()}` } });
  }

  deleteTask(taskId : string) {
    return this._http.delete('/api/users/' + this.auth.getUserDetails()._id + '/task/' + taskId, { headers: { Authorization: `Bearer ${this.auth.getToken()}` } });
  }

  updateTask(task: any) {
    return this._http.put('/api/users/' + this.auth.getUserDetails()._id + '/task/' + task._id, task, { headers: { Authorization: `Bearer ${this.auth.getToken()}` } });
  }
}
