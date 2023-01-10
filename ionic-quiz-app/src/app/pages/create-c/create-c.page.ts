import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Collection } from 'src/app/data/Collection';
import { DatabaseService } from 'src/app/services/database.service';
import { AuthService } from 'src/app/services/auth.service';
import { ToastController } from '@ionic/angular';

// for modal
import { ModalController } from '@ionic/angular';
import { CreateQPage } from '../create-q/create-q.page';

@Component({
  selector: 'app-create-c',
  templateUrl: './create-c.page.html',
  styleUrls: ['./create-c.page.scss'],
})
export class CreateCPage implements OnInit {

  colls;
  private collTitles: string[];
  private collectionName: string = "";
  private visibility: string = "public";
  private coll: Collection;
  private collectionID: string = "";

  collectionForm: FormGroup;

  constructor(public formBuilder: FormBuilder,
    private modalController: ModalController,
    private databaseService: DatabaseService,
    public authSerive: AuthService,
    private toastController: ToastController) {
  }

  ngOnInit() {
    this.collectionForm = this.formBuilder.group({
      collName: ['', Validators.required],
    });
    // leere Sammlung erstellen, wird später mit Werten befüllt
    this.coll = new Collection("", "", "", [], new Date());
  }

  get errorControl() {
    return this.collectionForm.controls;
  }

  onClose() {
    this.modalController.dismiss();
  }

  getValue(val) {
    this.visibility = val.detail.value;
  }

  async createCollection() {
    // Sammlungstitel für Vergleich laden
    this.collTitles = this.colls.map(key => key.title);

    // falls Sammlungstitel bereits vergeben:
    if (this.collTitles.includes(this.collectionName)) {
      const toast = await this.toastController.create({
        message: 'Sammlungstitel "' + this.collectionName + '" bereits vergeben!',
        duration: 2500,
        position: 'middle',
        cssClass: 'toast-custom-class'
      });
      toast.present();
    // falls nicht, Werte laden und Sammlung erstellen/speichern:
    } else {
      this.coll.author = this.authSerive.user_email;
      this.coll.title = this.collectionName;
      this.coll.visibility = this.visibility;
      this.coll.date = new Date();
      this.databaseService.firestore.collection('Collection').add({
        author: this.coll.author,
        title: this.coll.title,
        visibility: this.coll.visibility,
        completedBy: this.coll.completedBy,
        date: this.coll.date
      }).then(collRef => {
        this.createQuestions(collRef.id);
      });
    }
  }

  async createQuestions(collID: string) {
    this.modalController.dismiss();
    const modal = await this.modalController.create({
      component: CreateQPage,
      componentProps: {
        coll: this.coll,
        collID: collID,
      },
      cssClass: 'createQuestion'
    });
    modal.present();
  }

}
