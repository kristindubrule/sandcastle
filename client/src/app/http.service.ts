import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import * as io from 'socket.io-client';

const SERVER_URL = 'http://localhost:8000';

@Injectable()
export class HttpService {
  user = "5adfdce7df2046f907d27ea4";
  private socket: SocketIOClient.Socket; // The client instance of socket.io

  constructor(private _http: HttpClient) { 
    // this.socket.on('tasks_updated', function(){
    //   console.log('tasks updated');
    // });
  }

  public initSocket(): void {
    this.socket = io(SERVER_URL);
  }

  public onEvent(): Observable<any> {
    return new Observable<any>(observer => {
        this.socket.on('tasks_updated', () => {
          observer.next();
        });
    });
  }

  getTasks() {
    return this._http.get('/api/users/' + this.user + '/task');
  }

  addTask(task: any) {
    return this._http.post('/api/users/' + this.user + '/task', task);
  }

  deleteTask(taskId : string) {
    return this._http.delete('/api/users/' + this.user + '/task/' + taskId);
  }

  updateTask(task: any) {
    return this._http.put('/api/users/' + this.user + '/task/' + task._id, task);
  }
}
