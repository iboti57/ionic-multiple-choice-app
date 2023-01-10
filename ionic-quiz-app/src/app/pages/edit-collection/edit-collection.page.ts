import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatabaseService } from 'src/app/services/database.service';
import { AuthService } from 'src/app/services/auth.service';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

// for modal
import { ModalController } from '@ionic/angular';
import { Collection } from 'src/app/data/Collection';

@Component({
  selector: 'app-edit-collection',
  templateUrl: './edit-collection.page.html',
  styleUrls: ['./edit-collection.page.scss'],
})
export class EditCollectionPage implements OnInit {

  coll;
  colls;
  counterSize;
  collTitles: string[];
  private collectionName: string;
  private visibility: string;
  private collectionSize = 0;
  private collID: string;
  private completedBy: string[] = [];
  private completed: boolean;

  editForm: FormGroup;

  constructor(public formBuilder: FormBuilder,
    private modalController: ModalController,
    private databaseService: DatabaseService,
    public authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router) {
  }

  ngOnInit() {
    this.editForm = this.formBuilder.group({
      collName: ['', Validators.required],
    });
    // Werte aus der Sammlung in die Felder laden
    this.collectionName = this.coll.title;
    this.visibility = this.coll.visibility;
    this.collID = this.coll.id;
    this.databaseService.read_questions(this.collID).then(questions => {
      this.collectionSize = questions.length;
    });
    this.completedBy = this.coll.completedBy;
    if (this.completedBy.includes(this.authService.user_email)) this.completed = true;
  }

  onClose() {
    this.modalController.dismiss();
  }

  ngOnDestroy() {

  }

  getValue(val) {
    this.visibility = val.detail.value;
  }

  checkUser(): boolean {
    if (this.coll.author == this.authService.user_email) return true;
    return false;
  }

  editQuestions() {
    this.modalController.dismiss();
    this.router.navigateByUrl('/view-questions/' + this.collID);
  }

  deleteCollection(really) {
    if (really) {
      this.databaseService.firestore.collection('Collection').doc(this.collID).delete();
    } else {
      this.deleteDialogue();
    }
  }

  async deleteDialogue() {
    const alert = await this.alertController.create({
      header: 'Sammlung löschen',
      message: 'Möchten Sie die Sammlung <p><b>"' + this.coll.title + '"</b></p> wirklich löschen?',
      buttons: [
        { text: 'Ja', handler: () => { this.deleteCollection(true); this.modalController.dismiss(); } },
        { text: 'Nein', handler: () => { this.alertController.dismiss(); } }
      ],
      cssClass: 'alert-custom-class'
    });
    await alert.present();
  }

  async save() {
    this.collTitles = this.colls.map(key => key.title);
    var excludeTitle = this.colls.find(key => key.id == this.collID);
    this.collTitles = this.collTitles.filter(key => key != excludeTitle.title);
    var collVis = this.colls.filter(key => key.title == this.collectionName && key.visibility == 'public');

    if (this.collTitles.includes(this.collectionName)) {
      const toast = await this.toastController.create({
        message: 'Sammlungstitel \'' + this.collectionName + '\' bereits vergeben!',
        duration: 2500,
        position: 'middle',
        cssClass: 'toast-custom-class'
      });
      toast.present();
    } else {
      if (collVis.length > 0 && (this.coll.visibility == 'private' && this.visibility == 'public')) {
        const toast = await this.toastController.create({
          message: 'Öffentliche Sammlung \'' + this.collectionName + '\' bereits vorhanden!',
          duration: 2500,
          position: 'middle',
          cssClass: 'toast-custom-class'
        });
        toast.present();
      } else {
        this.completedBy = this.coll.completedBy;
        if (this.collectionName != this.coll.title || this.visibility != this.coll.visibility) {
          if (this.completedBy.includes(this.authService.user_email)) {
            // aktuellen Benutzer aus completedBy-Array löschen
            this.completedBy = this.completedBy.filter(key => {
              return key != this.authService.user_email;
            });

            this.databaseService.firestore.collection('Collection').doc(this.coll.id).update({
              completedBy: this.completedBy
            });
          }
        }
        // Sammlung mit aktuellen Werten aktualisieren
        this.databaseService.firestore.collection('Collection').doc(this.coll.id).update({
          author: this.authService.user_email,
          title: this.collectionName,
          visibility: this.visibility,
          completedBy: this.coll.completedBy,
          date: new Date()
        });
        this.modalController.dismiss();
      }
    }
  }

  async resetCollection() {
    // completedBy-Array laden
    this.completedBy = this.coll.completedBy;
    if (this.completedBy.includes(this.authService.user_email)) {
      // aktuellen Benutzer aus completedBy-Array löschen und aktualisieren
      this.completedBy = this.completedBy.filter(key => {
        return key != this.authService.user_email;
      });

      this.databaseService.firestore.collection('Collection').doc(this.collID).update({
        completedBy: this.completedBy
      });
    }
    // Counter aller Fragen zurücksetzen
    this.databaseService.read_questions(this.collID).then(questions => {
      questions.forEach(key => {
        this.databaseService.firestore.collection('Collection').doc(this.collID).collection('Question').doc(key.id).update({
          counter: 0
        });
      });
    });
    const toast = await this.toastController.create({
      message: 'Sammlung \'' + this.collectionName + '\' zurückgesetzt!',
      duration: 2500,
      cssClass: 'toast-custom-class'
    });
    toast.present();
    this.modalController.dismiss();
  }
}
