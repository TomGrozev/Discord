import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {UserService} from '../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loading$ = false;

  constructor(public userService: UserService, private router: Router) {
  }

  ngOnInit() {
    this.userService.loggedInObserve().subscribe(loggedIn => {
      if (loggedIn) {
        this.router.navigate(['/']);
      }
    });
  }

  login() {
    this.loading$ = true;

    this.userService.login();
  }

}
