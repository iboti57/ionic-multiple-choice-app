import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { DatabaseService } from "../../services/database.service";
import { ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-result',
  templateUrl: './result.page.html',
  styleUrls: ['./result.page.scss'],
})
export class ResultPage implements OnInit {

  mode;
  coll;
  ques;
  correctAnswerCounter;
  private collID: string;
  private quesLen: number;
  private questions: number;
  private completed: boolean;
  private percentage: number;

  private completedBy: string[] = [];

  constructor(
    public router: Router,
    private databaseService: DatabaseService,
    private modalController: ModalController,
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.collID = this.coll.id;
    this.quesLen = this.ques.length;
    this.completed = false;
    this.check();
  }

  check() {
    // Ergebnis anhand der korrekten Anzahl der Fragen überprüfen und das Ergebnis als
    // Prozentzahl mit 2 Nachkommastellen speichern
    this.percentage = +((this.correctAnswerCounter / this.quesLen) * 100).toFixed(2);
    // falls Ergebnis mindestens 50% (bestanden)
    if ((this.percentage) >= 50) {
      if (this.mode == 1 && this.authService.user_email != 'guest') {
        this.completedBy = this.coll.completedBy;
        // aktuellen Benutzer zu completedBy-Array hinzufügen
        if (!this.completedBy.includes(this.authService.user_email)) {
          this.completedBy.push(this.authService.user_email);
          this.databaseService.firestore.collection('Collection').doc(this.collID).update({
            completedBy: this.completedBy
          });
        }
      }
      this.completed = true;
      // falls Ergebnis unter 50% (nicht bestanden)
    } else {
      if (this.mode == 1 && this.authService.user_email != 'guest') {
        this.completedBy = this.coll.completedBy;
        if (this.completedBy.includes(this.authService.user_email)) {
          // aktuellen Benutzer aus completedBy-Array löschen, falls nicht bereits geschehen
          this.completedBy = this.completedBy.filter(key => {
            return key != this.authService.user_email;
          });

          this.databaseService.firestore.collection('Collection').doc(this.collID).update({
            completedBy: this.completedBy
          });
        }
      }
      this.completed = false;
    }
  }

  onClose() {
    this.modalController.dismiss();
    this.router.navigateByUrl('home');
  }

  ngOnDestroy() {
    this.router.navigateByUrl('home');
  }
}
