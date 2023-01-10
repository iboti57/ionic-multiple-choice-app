import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Collection } from 'src/app/data/Collection';
import { Question } from 'src/app/data/Question';
import { DatabaseService } from 'src/app/services/database.service';
import { AuthService } from 'src/app/services/auth.service';
import { CreateQPage } from '../create-q/create-q.page';
import { ModalController } from '@ionic/angular';
import { EditQuestionPage } from '../edit-question/edit-question.page';

@Component({
  selector: 'app-view-questions',
  templateUrl: './view-questions.page.html',
  styleUrls: ['./view-questions.page.scss'],
})
export class ViewQuestionsPage implements OnInit {

  private collID: string;
  private collAuthor: string;
  private collTitle: string;
  private collection: Collection;
  private question: Question;
  private questions: Question[] = [];
  private questionsBackup: Question[] = [];
  private loading: boolean;
  private searchText;
  private alreadySortedByText: boolean;

  constructor(public router: Router,
    public authService: AuthService,
    private toastController: ToastController,
    private activatedRoute: ActivatedRoute,
    private databaseService: DatabaseService,
    private modalController: ModalController
  ) {
    this.collID = this.activatedRoute.snapshot.paramMap.get('id');
    this.getCollections();
    this.getQuestions();
  }

  ngOnInit() {
    this.loading = true;
    this.getCollections();
    this.getQuestions();
  }

  getCollections() {
    this.databaseService.read_collections().then(collections => {
      this.collection = collections.find(key => {
        return key.id == this.collID;
      });
    }).then(() => {
      this.collTitle = this.collection.title;
      this.collAuthor = this.collection.author;
      this.loading = false;
    });
    const observable_Collections = this.databaseService.getObservable_Collections();
    observable_Collections.subscribe(questionsPromise => {
      //console.log("observable list");
      questionsPromise.then(collections => {
        this.collection = collections.find(key => {
          return key.id == this.collID;
        });
      });
    });
  }

  getQuestions() {
    // Fragen aus der aktuellen Sammlung laden
    this.databaseService.read_questions(this.collID).then(questions => {
      this.questions = questions.sort((a, b) => {
        return a.qNumber - b.qNumber;
      });
      this.questionsBackup = this.questions;
    });
    const observable_Questions = this.databaseService.getObservable_Questions(this.collID);
    observable_Questions.subscribe(questionsPromise => {
      questionsPromise.then(questions => {
        this.questions = questions.sort((a, b) => {
          return a.qNumber - b.qNumber;
        });
        this.questionsBackup = this.questions;
      }).then(() => {
        if (this.questions.length < 1) {
          this.databaseService.firestore.collection('Collection').doc(this.collection.id).delete();
          this.returnToHome();
        }
      });
    });
  }

  returnToHome() {
    this.router.navigateByUrl('/home');
  }

  // for Searchbar
  searchQuestions(text) {
    this.questions = this.questionsBackup;
    this.searchText = text;
    this.questions = this.questions.filter((items) => {
      return (items.text).toLowerCase().indexOf(this.searchText.detail.value.toLowerCase()) > -1;
    });
  }

  sortQuestions() {
    this.questions = this.questions.sort((a, b) => {
      return a.text.localeCompare(b.text);
    });
    if (this.alreadySortedByText) this.questions.reverse();
    this.alreadySortedByText = !this.alreadySortedByText;
  }

  reloadQuestions(ev) {
    this.alreadySortedByText = null;
    this.getQuestions();

    setTimeout(() => {
      ev.target.complete();
      this.showReloadToast();
    }, 500);
  }

  async editQuestion(id) {
    const modal = await this.modalController.create({
      component: EditQuestionPage,
      componentProps: {
        ques: id,
        coll: this.collection,
        collSize: this.questions.length
      },
      cssClass: 'createQuestion'
    });
    modal.present();
  }

  async showReloadToast() {
    const toast = await this.toastController.create({
      message: 'Fragen neu geladen!',
      duration: 2500,
      cssClass: 'reload-toast',
      position: 'top'
    });
    toast.present();
  }

  async createQuestions() {
    const modal = await this.modalController.create({
      component: CreateQPage,
      componentProps: {
        coll: this.collection,
        collID: this.collID
      },
      cssClass: 'createQuestion'
    });
    modal.present();
  }

}
