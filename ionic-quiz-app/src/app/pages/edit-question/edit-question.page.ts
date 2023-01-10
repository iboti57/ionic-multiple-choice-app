import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInput, IonRadioGroup } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database.service';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ModalController, AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-edit-question',
  templateUrl: './edit-question.page.html',
  styleUrls: ['./edit-question.page.scss'],
})
export class EditQuestionPage implements OnInit {

  ques;
  coll;
  collSize;
  private questionText: string = "";
  private thisQuestion;

  //private questionText: string = "";
  private answerText = ["", "", "", ""];
  private qNumber: number;

  private completedBy: string[] = [];

  questionForm: FormGroup;

  @ViewChild('qText')
  private qText: IonInput;

  @ViewChild('qAnswers')
  private correctAnswerNumber: IonRadioGroup;

  constructor(private authService: AuthService,
    public formBuilder: FormBuilder,
    private databaseService: DatabaseService,
    private modalController: ModalController,
    private alertController: AlertController) { }

  ngOnInit() {
    this.questionForm = this.formBuilder.group({
      questionName: ['', Validators.required],
      aText1: ['', Validators.required],
      aText2: ['', Validators.required],
      aText3: ['', Validators.required],
      aText4: ['', Validators.required]
    });
    // Frage und Werte laden
    this.getQuestion();
    this.qNumber = this.ques.qNumber;
    this.questionText = this.ques.text;
    this.answerText = this.ques.answers;
    this.completedBy = this.coll.completedBy;
  }

  get errorControl() {
    return this.questionForm.controls;
  }

  ionViewDidEnter() {
    this.qText.setFocus();
  }

  ionViewWillEnter() {
    this.correctAnswerNumber.value = "" + this.ques.correct_answer;
  }

  onClose() {
    this.modalController.dismiss();
  }

  getQuestion() {
    this.databaseService.read_questions(this.coll.id).then(questions => {
      this.thisQuestion = questions.find(key => key.id == this.ques.id);
    });
    const observable_Questions = this.databaseService.getObservable_Questions(this.coll.id);
    observable_Questions.subscribe(questionsPromise => {
      questionsPromise.then(questions => {
        this.thisQuestion = questions.find(key => key.id == this.ques.id);
      });
    });
  }

  deleteQuestion(really) {
    if (really) {
      var quesColl = this.databaseService.firestore.collection('Collection').doc(this.coll.id).collection('Question');

      // Fragenummer (qNumber) von allen nachfolgenden Fragen um 1 reduzieren
      var followingQuestions = [];
      var inc = 0;
      quesColl.get().forEach(doc => {
        doc.docs.forEach(key => {
          if (key.data().qNumber > this.qNumber) followingQuestions[inc++] = key.id;
        });
      }).then(() => {
        var newQNumber = this.qNumber;
        followingQuestions.forEach(doc => {
          quesColl.doc(doc).update({
            qNumber: newQNumber++
          });
        });
      });
      this.databaseService.firestore.collection('Collection').doc(this.coll.id).collection('Question').doc(this.ques.id).delete();
      // alle Benutzer aus completedBy-Array löschen und aktualisieren
      this.completedBy = [];

      this.databaseService.firestore.collection('Collection').doc(this.coll.id).update({
        completedBy: this.completedBy
      });
    } else {
      this.deleteDialogue();
    }
  }

  async deleteDialogue() {
    if (this.collSize <= 1) {
      const alert = await this.alertController.create({
        header: "Frage und Sammlung löschen",
        message: "Möchten Sie die Frage #" + this.qNumber + " <p><b>\"" + this.ques.text + "\"</b></p> und damit die Sammlung<p><b>\"" + this.coll.title + "\"</b></p> wirklich löschen?",
        buttons: [
          { text: "Ja", handler: () => { this.deleteQuestion(true); this.modalController.dismiss(); } },
          { text: "Nein", handler: () => { this.alertController.dismiss() } }
        ],
        cssClass: "alert-custom-class"
      });
      await alert.present();
    } else {
      const alert = await this.alertController.create({
        header: "Frage löschen",
        message: "Möchten Sie die Frage #" + this.qNumber + " <p><b>\"" + this.ques.text + "\"</b></p> wirklich löschen?",
        buttons: [
          { text: "Ja", handler: () => { this.deleteQuestion(true); this.modalController.dismiss(); } },
          { text: "Nein", handler: () => { this.alertController.dismiss() } }
        ],
        cssClass: "alert-custom-class"
      });
      await alert.present();
    }
  }

  async save() {
    // falls etwas an der Frage geändert wurde:
    if (this.questionText != this.thisQuestion.text || this.answerText.toString() != this.thisQuestion.answers.toString()
      || +this.correctAnswerNumber.value != this.thisQuestion.correct_answer) {
      // alle Benutzer aus completedBy-Array löschen
      this.completedBy = [];

      this.databaseService.firestore.collection('Collection').doc(this.coll.id).update({
        completedBy: this.completedBy
      });
    }
    // Frage mit aktuellen Werten aktualisieren
    this.databaseService.firestore.collection('Collection').doc(this.coll.id).collection('Question').doc(this.thisQuestion.id).update({
      text: this.questionText,
      qNumber: this.qNumber,
      correct_answer: +this.correctAnswerNumber.value,
      answers: [
        this.answerText[0],
        this.answerText[1],
        this.answerText[2],
        this.answerText[3]
      ],
      solved: this.ques.solved
    });

    this.modalController.dismiss();
  }

}
