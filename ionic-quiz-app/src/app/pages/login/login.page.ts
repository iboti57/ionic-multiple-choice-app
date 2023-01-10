import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IonInput } from '@ionic/angular';
import { Router } from "@angular/router";
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  public command: string;
  validationForm: FormGroup;
  validationMessages: any;

  constructor(public formBuilder: FormBuilder,
    public router: Router,
    public authService: AuthService) {
    this.prepareFormValidation();
  }

  ngOnInit() {

  }

  prepareFormValidation() {
    this.validationForm = this.formBuilder.group({
      Email: new FormControl('', Validators.compose([Validators.required])),
      Password: new FormControl('', Validators.compose([Validators.required]))
    });

    this.validationMessages = {
      'Email': [
        { type: 'required', message: 'Email erforderlich.' }
      ],
      'Password': [
        { type: 'required', message: 'Passwort erforderlich.' }
      ]
    };
  }

  resetPassword(email: IonInput) {
    // Reset-Email senden
    //this.authService.resetPassword(email.value as string);
  }

  logInAsGuest() {
    // als Gast einloggen und Gast im localStorage speichern
    this.authService.signInAsGuest()
      .then(() => {
        this.router.navigateByUrl('/home');
      }).catch((error) => {
        window.alert(error.message)
      });
    localStorage.setItem('LoggedInUser', 'guest');
  }

  logIn(email: IonInput, password: IonInput) {
    // als Benutzer einloggen (falls registriert) und E-Mail im localStorage speichern
    this.authService.signIn(email.value as string, password.value as string)
      .then(() => {
        this.router.navigateByUrl('/home');
      }).catch((error) => {
        window.alert(error.message)
      });
    localStorage.setItem('LoggedInUser', email.value as string);
  }

  public logOut() {
    // ausloggen
    this.authService.signOut()
      .then(() => {
        this.router.navigateByUrl('/login');
      }).catch((error) => {
        window.alert(error.message)
      });
  }

}
