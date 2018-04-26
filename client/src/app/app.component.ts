import { Component, OnInit } from '@angular/core';
	import { HttpService } from './http.service';
	import { ActivatedRoute, Params, Router } from '@angular/router';
  import { AuthenticationService } from './authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private _httpService: HttpService,
    public auth: AuthenticationService,
    private _route: ActivatedRoute,
    private _router: Router) {}

  ngOnInit() {
    if(!this.auth.isLoggedIn()) {
      this._router.navigate(['login']);
    } else {
      console.log('all good');
    }
  }

  // callLogout() {
  //   this.auth.logout();
  //   //this.goHome();
  // }

  goHome() {
    this._router.navigate(['login']);
  }
}