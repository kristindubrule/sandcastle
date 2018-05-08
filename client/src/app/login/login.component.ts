import { Component } from '@angular/core';
import { AuthenticationService, TokenPayload } from '../authentication.service';
import { Router } from '@angular/router';

@Component({
  templateUrl: './login.component.html'
})
export class LoginComponent {
  credentials: TokenPayload = {
    username: '',
    password: ''
  };
  messages = [];

  constructor(private auth: AuthenticationService, private router: Router) {}

  login() {
    this.auth.login(this.credentials).subscribe( data => {
      if (data['token']) {
        this.router.navigate(['']);
      } else {
        this.messages = ['Invalid credentials'];
      }
    }, (err) => {
      this.messages = ['Invalid credentials'];
    }); 
  }
}
