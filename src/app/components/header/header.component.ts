import {Component, HostListener, OnInit} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'comp-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  animations: [
    trigger('collapse', [
      state('open', style({
        opacity: '1'
      })),
      state('closed',   style({
        opacity: '0',
        // display: 'none',
      })),
      transition('closed => open', animate('400ms ease-in')),
      transition('open => closed', animate('100ms ease-out'))
    ])
  ]
})
export class HeaderComponent implements OnInit {

  appTitle = 'VATPAC Discord Link';

  navToggled = false;
  _isNavbarCollapsedAnim = 'closed';

  constructor(public userService: UserService) { }

  ngOnInit() {
    this.onResize(window);
  }

  @HostListener('window:resize', ['$event.target'])
  onResize(event) {
    if (event.innerWidth > 767){
      // need to set this to 'open' for large screens to show up because of opacity in 'closed' animation.
      this._isNavbarCollapsedAnim = 'open';
      this.navToggled = false;
    }
  }

  toggleNavbar(): void {
    if(this.navToggled){
      this._isNavbarCollapsedAnim = 'closed';
      this.navToggled = false;
    } else {
      this._isNavbarCollapsedAnim = 'open';
      this.navToggled = true;
    }
  }
  get isNavbarCollapsedAnim() : string {
    return this._isNavbarCollapsedAnim;
  }

}
