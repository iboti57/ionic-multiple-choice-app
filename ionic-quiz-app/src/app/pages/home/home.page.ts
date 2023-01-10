import { Component, OnInit, ViewChild } from '@angular/core';
import { Collection } from 'src/app/data/Collection';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import { ActionSheetController, AlertController, IonSegment, ToastController } from '@ionic/angular';
import { IonSearchbar } from '@ionic/angular';

// for modal
import { IonInput, ModalController } from '@ionic/angular';
import { CreateCPage } from '../create-c/create-c.page';
import { EditCollectionPage } from '../edit-collection/edit-collection.page';
import { Router } from '@angular/router';
import { Question } from "../../data/Question";

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})

export class HomePage implements OnInit {

  @ViewChild('search')
  private search: IonSearchbar;

  @ViewChild('segment')
  private segment: IonSegment;

  private collections: Collection[] = [];
  private collectionsBackup: Collection[];
  private mode: string = "learn";
  private modeSelection: IonInput;
  private user: string;
  private loading: boolean;
  public collectionsUpdated: boolean;
  private filter: string;
  private filteredByAuthor: boolean;
  private alreadySortedByName: boolean;
  private alreadySortedByTime: boolean;
  private searchText;
  private questions: Question[] = [];
  private counterSize: number;

  private collectionCount: [number, number, number];
  private collectionCountStart: [number, number, number];

  constructor(
    public router: Router,
    public authService: AuthService,
    private databaseService: DatabaseService,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController,
    private modalController: ModalController,
    private alertController: AlertController
  ) {
    this.filter = "all";
    this.getCollections(this.filter);
  }

  ngOnInit() {
    this.loading = true;
    this.filteredByAuthor = false;
    this.collectionCount = [0, 0, 0];

    // delete empty Collections from database
    this.deleteEmptyCollections();
  }

  ionViewWillEnter() {
    this.getCollections(this.filter);
    this.loading = true;
    this.user = localStorage.getItem('LoggedInUser');
  }

  deleteEmptyCollections() {
    var removed_items = [];
    this.databaseService.read_collections().then(collections => {
      collections.forEach(key1 => {
        this.databaseService.firestore.collection('Collection').doc(key1.id).collection('Question').get().subscribe(key2 => {
          if (key2.size < 1) {
            removed_items.push("'" + key1.id + "'");
            this.databaseService.firestore.collection('Collection').doc(key1.id).delete();
          }
        });
      });
    });
    setTimeout(() => {
      if (removed_items.length > 1) console.log("Removed empty collections: " + removed_items.toString().replace("[", "").replace("]", ""));
      else if (removed_items.length == 1) console.log("Removed empty collection: " + removed_items.toString().replace("[", "").replace("]", ""));
      else console.log("Removed no empty collections!");
    }, 2000);
  }

  getCollections(filter) {
    this.user = this.authService.user_email;
    if (this.user.length < 1) {
      this.user = localStorage.getItem('LoggedInUser');
    }
    // Sammlungen aus der firestore Database laden
    this.databaseService.read_collections().then(collections => {
      if (this.loading || this.collectionsUpdated) {
        if (this.filteredByAuthor) collections = collections.filter(key => { return key.author == this.user });
        var colls = collections.filter(key => key.author == this.user || key.visibility == "public");
        this.collectionCount[0] = colls.length;
        this.collectionCount[1] = colls.filter(key => key.completedBy.includes(this.user)).length;
        this.collectionCount[2] = colls.filter(key => !key.completedBy.includes(this.user)).length;
        this.collectionCountStart = this.collectionCount;
      }
      // nach 'Bearbeitet' und 'Unbearbeitet' filtern
      if (filter == "complete") {
        collections = collections.filter(key => key.completedBy.includes(this.user));
      } else if (filter == "incomplete") {
        collections = collections.filter(key => !key.completedBy.includes(this.user));
      }
      if (this.filteredByAuthor) {
        this.collections = collections.filter(key => {
          return key.author == this.user;
        });
      } else {
        // nur eigene und öffentliche Sammlungen von anderen Benutzern anzeigen
        this.collections = collections.filter(key => {
          return key.author == this.user || key.visibility == "public";
        });
      }
      this.collectionsBackup = this.collections;
    }).then(() => {
      this.loading = false;
      this.collectionsUpdated = false;
      this.alreadySortedByName = null;
      this.alreadySortedByTime = null;
    });
    const observable_Collections = this.databaseService.getObservable_Collections();
    observable_Collections.subscribe(questionsPromise => {
      //console.log("observable list");
      questionsPromise.then(collections => {
        if (this.loading || this.collectionsUpdated) {
          var colls = collections.filter(key => key.author == this.user || key.visibility == "public");
          this.collectionCount[0] = colls.length;
          this.collectionCount[1] = colls.filter(key => key.completedBy.includes(this.user)).length;
          this.collectionCount[2] = colls.filter(key => !key.completedBy.includes(this.user)).length;
          this.collectionCountStart = this.collectionCount;
        }
        if (filter == "complete") {
          collections = collections.filter(key => key.completedBy.includes(this.user));
        } else if (filter == "incomplete") {
          collections = collections.filter(key => !key.completedBy.includes(this.user));
        }
        if (this.filteredByAuthor) {
          this.collections = collections.filter(key => {
            return key.author == this.user;
          });
        } else {
          this.collections = collections.filter(key => {
            return key.author == this.user || key.visibility == "public";
          });
        }
        this.collectionsBackup = this.collections;
      });
    });

  }

  reloadCollections(ev) {
    this.filteredByAuthor = false;
    this.getCollections("all");

    setTimeout(() => {
      ev.target.complete();
      this.showReloadToast();
    }, 500);
    this.segment.value = "all";
    this.loading = true;
  }

  async showReloadToast() {
    const toast = await this.toastController.create({
      message: 'Sammlungen neu geladen!',
      duration: 2500,
      cssClass: 'reload-toast',
      position: 'top'
    });
    toast.present();
  }

  segmentChanged(seg) {
    if (!this.loading && this.user != 'guest') {
      this.search.value = "";
      this.filter = seg.detail.value;
      this.getCollections(seg.detail.value);
      setTimeout(() => {
        this.collectionCount = this.collectionCountStart;
      }, 500);
    }
  }

  searchCollection(title) {
    // Sammlungen durchsuchen (und vorher sichern)
    this.collections = this.collectionsBackup;
    this.searchText = title;
    this.collections = this.collections.filter((items) => {
      return (items.title).toLowerCase().indexOf(this.searchText.detail.value.toLowerCase()) > -1;
    });
    if (this.searchText.detail.value != undefined) {
      this.collectionCount = [
        this.collections.length,
        this.collections.filter(key => key.completedBy.includes(this.user)).length,
        this.collections.filter(key => !key.completedBy.includes(this.user)).length
      ];
    }
  }

  async filterByAuthor() {
    // nur eigene Sammlungen anzeigen
    this.collectionsUpdated = true;
    this.getCollections(this.filter);
    this.filteredByAuthor = !this.filteredByAuthor;
  }

  sortCollections(by) {
    // Sammlungen nach Name/Titel oder Zeit sortieren (absteigend/aufsteigend)
    if (by == "name") {
      this.collections = this.collections.sort((a, b) => {
        return a.title.localeCompare(b.title);
      });
      if (this.alreadySortedByName) this.collections.reverse();
      this.alreadySortedByName = !this.alreadySortedByName;
      this.alreadySortedByTime = null;
    } else if (by == "time") {
      this.collections = this.collections.sort((a, b) => {
        if (a.date > b.date) return 1;
        else if (a.date < b.date) return -1;
        else return 0;
      });
      if (this.alreadySortedByTime) this.collections.reverse();
      this.alreadySortedByTime = !this.alreadySortedByTime;
      this.alreadySortedByName = null;
    } else {
      console.log("error sorting");
    }
  }

  // Lern- und Prüfungsmodus auswählen und starten
  async showSheet(coll) {
    const sheet = await this.actionSheetController.create({
      header: 'Modus auswählen',
      buttons: [
        { text: 'Lernmodus', handler: () => { this.startMode(coll, 0) } },
        { text: 'Prüfungmodus', handler: () => { this.startMode(coll, 1); } },
        { text: 'Abbrechen', role: 'cancel' }
      ]
    });
    await sheet.present();
  }

  startMode(coll, mode) {
    this.databaseService.read_questions(coll.id).then(questions => {
      if (mode == 0) this.questions = questions.filter(q => q.counter < 5);
      else this.questions = questions;
    }).then(() => {
      if (this.questions.length <= 0) {
        this.isSolved(coll);
      } else {
        this.router.navigateByUrl('/mode/' + mode + '/' + coll.id);
      }
    });
    this.collectionsUpdated = true;
  }

  async isSolved(coll) {
    const solved_alert = await this.alertController.create({
      header: 'Sammlung bereits gelernt',
      message: 'Alle Fragen in dieser Sammlung wurden schon fünfmal richtig beanwortet.<p>Sammlung zurücksetzen?</p>',
      buttons: [
        { text: 'Ja', handler: () => { this.resetCounter(coll); this.alertController.dismiss(); } },
        { text: 'Nein', handler: () => { this.alertController.dismiss(); } }
      ],
      cssClass: 'alert-custom-class',
    });
    solved_alert.present();
  }

  resetCounter(coll) {
    var quesColl = this.databaseService.firestore.collection('Collection').doc(coll.id).collection('Question');
    quesColl.ref.get().then(resp => {
      resp.docs.forEach(ques => {
        this.databaseService.firestore.collection('Collection').doc(coll.id).collection('Question').doc(ques.id).update({
          counter: 0
        });
      });
    }).then(() => {
      this.collectionsUpdated = true;
      this.showResetToast();
    });
  }

  async showResetToast() {
    const toast = await this.toastController.create({
      message: 'Sammlung wurde zurückgesetzt!',
      duration: 2500,
      cssClass: 'alert-custom-class',
    });
    toast.present();
  }

  editCollection(id) {
    this.counterSize = 0;
    this.databaseService.read_questions(id.id).then(q => {
      q.forEach(key => {
        if (key.counter >= 5) this.counterSize++;
      });
    }).then(() => {
      this.presentModal(true, id);
    });

  }

  // for Modal
  newCollection() {
    this.presentModal(false, null);
  }

  async presentModal(edit, coll) {
    if (edit) {
      const modal = await this.modalController.create({
        component: EditCollectionPage,
        componentProps: {
          coll: coll,
          colls: this.collections,
          counterSize: this.counterSize
        }
      });
      modal.present();
      this.collectionsUpdated = true;
    } else {
      const modal = await this.modalController.create({
        component: CreateCPage,
        componentProps: {
          colls: this.collections
        }
      });
      modal.present();
      this.collectionsUpdated = true;
    }
  }

  // for Logout
  logOut() {
    this.authService.signOut()
      .then((res) => {
        this.router.navigateByUrl('/login');
      }).catch((error) => {
        window.alert(error.message)
      });
  }

}
