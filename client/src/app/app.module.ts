import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HttpService } from './http.service';
import {FlexLayoutModule} from '@angular/flex-layout';
import { ToasterModule } from 'angular2-toaster';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { ListComponent } from './list/list.component';
import { EditComponent } from './list/edit/edit.component';


@NgModule({
  declarations: [
    AppComponent,
    ListComponent,
    EditComponent
  ],
  imports: [
    BrowserModule,
	    AppRoutingModule,
	    FormsModule,
      HttpClientModule,
      ToasterModule
  ],
  providers: [HttpService],
  bootstrap: [AppComponent]
})
export class AppModule { }
