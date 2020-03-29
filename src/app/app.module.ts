import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {HTTP_INTERCEPTORS, HttpClientModule, HttpClientXsrfModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AppRoutingModule} from './app-routing.module';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './home/home.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CoreHttpInterceptor} from './interceptors/http-interceptor.service';
import {DecimalPipe} from '@angular/common';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AlertService} from './services/alert.service';
import {AlertComponent} from './components/alert/alert.component';
import {LoginComponent} from './login/login.component';
import { ReportComponent } from './components/report/report.component';
import {faCheck, faEdit, faPlus, faQuestionCircle, faSort, faSortDown, faSortUp, faTimes, faTrash} from '@fortawesome/free-solid-svg-icons';
import {DiscordComponent} from './discord/discord.component';
import {NoteEditComponent} from './components/note-edit/note-edit.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    AlertComponent,
    LoginComponent,
    ReportComponent,
    NoteEditComponent,
    DiscordComponent
  ],
  entryComponents: [ReportComponent, NoteEditComponent],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'XSRF-TOKEN',
      headerName: 'X-XSRF-TOKEN'
    }),
    NgbModule,
    FontAwesomeModule,
    AppRoutingModule
  ],
  providers: [AlertService, DecimalPipe, { provide: HTTP_INTERCEPTORS, useClass: CoreHttpInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    [faQuestionCircle].forEach(icon => {
      library.addIcons(icon);
    });
  }
}
