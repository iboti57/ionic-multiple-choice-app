import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { AuthService } from "../services/auth.service";
import { filter, map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  public user: string;

  constructor(private authService: AuthService,
    private router: Router
  ) {

  }

  canActivate(): Observable<boolean> {

    return this.authService.isAuthenticated.pipe(
      filter(val => val !== null),
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          //console.log("activate true");
          return true;
        } else {
          window.alert("Bitte zunächst einloggen.");
          this.router.navigateByUrl('/login');
          //console.log("activate false");
          return false;
        }
      })
    );

  }

}