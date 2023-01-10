import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from "@ionic/angular";
import { Collection } from "../../data/Collection";
import { Question } from "../../data/Question";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { DatabaseService } from "../../services/database.service";
import { FormBuilder } from "@angular/forms";
import { Subscription } from "rxjs";
import { ResultPage } from '../result/result.page';

type AnswerRange = 1 | 2 | 3 | 4;

@Component({
  selector: 'app-mode',
  templateUrl: './mode.page.html',
  styleUrls: ['./mode.page.scss'],
})

export class ModePage implements OnInit {

  private subscription: Subscription = new Subscription();

  private mode: number;
  private qNumber: number;
  private temp: number = 0;
  private collID: string;
  private collAuthor: string;
  private collTitle: string;
  private collSize: number;
  private collection: Collection;
  private question: Question;
  private questions: Question[] = [];
  private questionsBackup: Question[] = [];
  private questionText: string = "";
  private answerText = ["", "", "", ""];
  private checked: boolean = false;

  private true_or_false: boolean;
  private counter: number;

  private correctAnswerCounter: number;

  private selectedShippingMethod: number = null;

  private completedBy: string[] = [];

  constructor(public router: Router,
    public authService: AuthService,
    private toastController: ToastController,
    public formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private databaseService: DatabaseService,
    private modalController: ModalController
  ) {
    this.mode = +this.activatedRoute.snapshot.paramMap.get('command');
    this.collID = this.activatedRoute.snapshot.paramMap.get('id');
    this.getCollections();
    this.getQuestions();
  };

  ngOnInit() {
    this.correctAnswerCounter = 0;
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Diese Frage wird in der nächsten Sitzung nicht mehr gestellt!',
      cssClass: 'toast-custom-class'
    });
    toast.present();
  }

  getCollections() {
    this.databaseService.read_collections().then(collections => {
      this.collection = collections.find(key => {
        return key.id == this.collID;
      });
      if (this.mode == 1 && this.authService.user_email != 'guest') {
        // completedBy-Array holen
        this.completedBy = this.collection.completedBy;
        if (this.completedBy.includes(this.authService.user_email)) {
          // User aus completedBy-Array löschen
          console.log(this.completedBy);
          this.completedBy = this.completedBy.filter(key => {
            return key != this.authService.user_email;
          });
          console.log(this.completedBy);

          this.databaseService.firestore.collection('Collection').doc(this.collection.id).update({
            completedBy: this.completedBy
          });
        }
      }
    }).then(() => {
      this.collTitle = this.collection.title;
      this.collAuthor = this.collection.author;
    });
    const observable_Collections = this.databaseService.getObservable_Collections();
    observable_Collections.subscribe(questionsPromise => {
      questionsPromise.then(collections => {
        this.collection = collections.find(key => {
          return key.id == this.collID;
        });
      });
    });
  }

  getQuestions() {
    this.databaseService.read_questions(this.collID).then(questions => {
      // Lernmodus
      if (this.mode == 0) {
        this.questions = questions.filter(q => q.counter < 5);
        this.questions = this.questions.sort((a, b) => {
          return a.qNumber - b.qNumber;
        });
      }
      // Prüfungsmodus
      if (this.mode == 1) {
        this.questions = questions;

        // Fragen zufällig
        this.questions = this.questions.sort((a, b) => {
          return 0.5 - Math.random();
        });
        // Antworten zufällig
        this.questions.forEach(key => {
          var correct_text = key.answers[key.correct_answer - 1];
          key.answers.sort((a, b) => {
            return 0.5 - Math.random();
          });
          // richtige Antwort wieder finden
          for (let i = 0; i < key.answers.length; i++) {
            if (key.answers[i] == correct_text) key.correct_answer = i + 1 as AnswerRange;
          }
        });
      }
    }).then(() => {
      this.collSize = this.questions.length;
      this.questionsBackup = this.questions;
      this.questionText = this.questions[this.temp].text;
      this.answerText = this.questions[this.temp].answers;
      this.qNumber = this.questions[this.temp].qNumber;
    });
    if (this.mode == 0) {
      const observable_Questions = this.databaseService.getObservable_Questions(this.collID);
      this.subscription.add(observable_Questions.subscribe(questionsPromise => {
        questionsPromise.then(questions => {
          this.questions = questions.sort((a, b) => {
            return a.qNumber - b.qNumber;
          });

          for (let i = 0; i < this.questionsBackup.length; i++) {
            this.questionsBackup[i] = this.questions.filter(w => w.id == this.questionsBackup[i].id)[0];
          }
          this.collSize = this.questionsBackup.length;
        });
      }));
    }
  }

  next() {
    if (!this.checked) this.check();
    this.selectedShippingMethod = null;
    this.checked = false;
    if (this.collSize - this.temp !== 1) {
      this.temp++;
      this.questionText = this.questionsBackup[this.temp].text
      this.answerText = this.questionsBackup[this.temp].answers;
      this.qNumber = this.questionsBackup[this.temp].qNumber;
      this.collSize = this.questionsBackup.length;
      this.counter = this.questionsBackup[this.temp].counter;
    }
    else {
      this.questionText = this.questionsBackup[this.temp].text
      this.answerText = this.questionsBackup[this.temp].answers;
      this.qNumber = this.questionsBackup[this.temp].qNumber;
      this.collSize = this.questionsBackup.length;
    }
  }

  previous() {
    this.selectedShippingMethod = null;
    this.checked = false;
    if (this.collSize - this.temp !== this.collSize) {
      this.temp--;
      this.questionText = this.questionsBackup[this.temp].text
      this.answerText = this.questionsBackup[this.temp].answers;
      this.qNumber = this.questionsBackup[this.temp].qNumber;
      this.counter = this.questionsBackup[this.temp].counter;
    }
    else {
      this.questionText = this.questionsBackup[this.temp].text
      this.answerText = this.questionsBackup[this.temp].answers;
      this.qNumber = this.questionsBackup[this.temp].qNumber;
      this.collSize = this.questionsBackup.length;
    }
  }

  async check() {
    this.checked = true;

    if (this.questionsBackup[this.temp].correct_answer == this.selectedShippingMethod) {
      if (this.mode == 0 && this.authService.user_email != 'guest') {
        this.databaseService.firestore.collection('Collection').doc(this.collID).collection('Question').doc(this.questionsBackup[this.temp].id).update({
          counter: this.questionsBackup[this.temp].counter + 1
        });

        if (this.questionsBackup[this.temp].counter >= 4) {
          this.presentToast();
        }
      }
      this.true_or_false = true;
      this.correctAnswerCounter++;
    }
    else {
      this.true_or_false = false;
    }
  }

  repeat() {
    this.selectedShippingMethod = null;
    this.checked = false;
    this.questionText = this.questionsBackup[this.temp].text;
    this.answerText = this.questionsBackup[this.temp].answers;
    this.qNumber = this.questionsBackup[this.temp].qNumber;
    this.counter = this.questionsBackup[this.temp].counter;
    window.location.reload();
  }

  async endMode(mode) {
    if (!this.checked) this.check();
    if (mode == 1) {
      this.checked = false;
    }
    const modal = await this.modalController.create({
      component: ResultPage,
      componentProps: {
        mode: mode,
        coll: this.collection,
        ques: this.questionsBackup,
        correctAnswerCounter: this.correctAnswerCounter
      }
    });
    modal.present();
  }

  onClose() {
    this.temp = 0;
    this.selectedShippingMethod = null;
    this.checked = false;
    this.subscription.unsubscribe();
    this.router.navigateByUrl('/home');
  }
}
