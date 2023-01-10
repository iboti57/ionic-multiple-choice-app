import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject, Observable, Observer } from 'rxjs';
import { getAuth, onAuthStateChanged, signInAnonymously, sendPasswordResetEmail } from "firebase/auth";

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  observer: Observer<string>;
  observable: Observable<string> = new Observable(observer => this.observer = observer);

  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  private user: string = "";
  private user_id: string = "";

  constructor(public angularFireAuth: AngularFireAuth) {
    this.angularFireAuth.onAuthStateChanged((user) => {
      if (user) {
        console.log("onAuthStateChanged (user logged in)");
        this.isAuthenticated.next(true);
        this.user_id = user.uid;
        this.user = user.email;
        //this.observer.next(user.email);
      } else {
        console.log("onAuthStateChanged (user logged out)");
        this.isAuthenticated.next(false);
        this.user_id = "";
        this.user = "";
        //this.observer.next("");
      }
    });
  }

  get user_email(): string {
    return this.user;
  }

  get user_user_id(): string {
    return this.user_id;
  }

  signIn(email: string, password: string) {
    return this.angularFireAuth.signInWithEmailAndPassword(email, password);
  }

  signInAsGuest() {
    const auth = getAuth();
    return signInAnonymously(auth)
      .then(() => {
        onAuthStateChanged(auth, (user) => {
          if (user) {
            console.log("onAuthStateChanged (user logged in)");
            //this.isAuthenticated.next(true);
            this.user_id = "1337";
            this.user = "guest";
            //this.observer.next(user.email);
          } else {
            console.log("onAuthStateChanged (user logged out)");
            this.isAuthenticated.next(false);
            this.user_id = "";
            this.user = "";
            //this.observer.next("");
          }
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  }

  signOut() {
    return this.angularFireAuth.signOut();
  }

  resetPassword(email: string) {
    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
      .then(() => {
        console.log("Email sent!");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorMessage);
      });
  }

  public getObservable() {
    return this.observable;
  }

}