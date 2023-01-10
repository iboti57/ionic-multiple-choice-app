import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInput, IonRadioGroup } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database.service';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ModalController, AlertController } from '@ionic/angular';
import { Question } from 'src/app/data/Question';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-create-q',
  templateUrl: './create-q.page.html',
  styleUrls: ['./create-q.page.scss'],
})
export class CreateQPage implements OnInit {

  coll;
  collID;

  private questionText: string = "";
  private answerText = ["", "", "", ""];

  private completedBy: string[] = [];

  private ques: Question;

  private qNumber: number = 1;

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
    // leere Frage erstellen, wird später mit Werten befüllt
    this.ques = new Question("", 1, ["", "", "", ""], 1, false);
    this.databaseService.firestore.collection('Collection').doc(this.collID).collection('Question').get().subscribe(key => {
      this.qNumber = key.size + 1;
    });
    this.completedBy = this.coll.completedBy;
  }

  get errorControl() {
    return this.questionForm.controls;
  }

  ionViewDidEnter() {
    this.qText.setFocus();
  }

  async save() {
    // Frage mit eingegebenen Werten der Sammlung hinzufügen
    await this.databaseService.firestore.collection('Collection').doc(this.collID).collection('Question').add({
      text: this.questionText,
      qNumber: this.qNumber,
      correct_answer: +this.correctAnswerNumber.value,
      answers: [
        this.answerText[0],
        this.answerText[1],
        this.answerText[2],
        this.answerText[3]
      ],
      solved: this.ques.solved,
      counter: 0
    });

    // (Eingabe-)Felder wieder zurücksetzen
    this.qNumber++;
    this.questionText = "";
    this.correctAnswerNumber.value = "1";
    this.answerText = ["", "", "", ""];

    this.completedBy = [];

    this.databaseService.firestore.collection('Collection').doc(this.coll.id).update({
      completedBy: this.completedBy
    });
  }

  onClose() {
    // falls bei Frage 1 abgebrochen wird:
    if (this.qNumber < 2) {
      this.deleteDialogue();
    } else {
      this.modalController.dismiss();
    }
  }

  async deleteDialogue() {
    const alert = await this.alertController.create({
      header: 'Leere Sammlung wird gelöscht',
      message: 'Die Sammlung <p><b>\"' + this.coll.title + '\"</b></p> beinhaltet keine Fragen und wird gelöscht.\nFortfahren?',
      buttons: [
        {
          text: 'Ja', handler: () => {
            this.databaseService.firestore.collection('Collection').doc(this.collID).delete();
            this.modalController.dismiss();
          }
        },
        { text: 'Nein', handler: () => { this.alertController.dismiss() } }
      ],
      cssClass: 'alert-custom-class'
    });
    await alert.present();
  }

  ngOnDestroy() {

  }

}
