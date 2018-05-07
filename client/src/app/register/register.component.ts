import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService, TokenPayload } from '../authentication.service';

@Component({
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  credentials: TokenPayload = {
    email: '',
    username: '',
    password: ''
  };
  messages = [];

  constructor(private auth: AuthenticationService, private router: Router) {}

  register() {
    this.messages = [];
    this.auth.register(this.credentials).subscribe( data => {
      if (data['message'] == 'Success') {
        this.router.navigate(['']);
      } else {
        for (let message_text in data['errors']) {
          this.messages.push(data['errors'][message_text].message);
        }
      }
    }, (err) => {
        this.messages.push('An unknown error occurred');
    });
  }
}