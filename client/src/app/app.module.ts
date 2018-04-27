import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HttpService } from './http.service';
import { AuthenticationService } from './authentication.service';
import {FlexLayoutModule} from '@angular/flex-layout';
import { ToasterModule } from 'angular2-toaster';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { ListComponent } from './list/list.component';
import { EditComponent } from './list/edit/edit.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { OtherUsersComponent } from './other-users/other-users.component';
import { SendTaskComponent } from './other-users/send-task/send-task.component';


@NgModule({
  declarations: [
    AppComponent,
    ListComponent,
    EditComponent,
    RegisterComponent,
    LoginComponent,
    OtherUsersComponent,
    SendTaskComponent
  ],
  imports: [
    BrowserModule,
	    AppRoutingModule,
	    FormsModule,
      HttpClientModule,
      ToasterModule
  ],
  providers: [HttpService, AuthenticationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
