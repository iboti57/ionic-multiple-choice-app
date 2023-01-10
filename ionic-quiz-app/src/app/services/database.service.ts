import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from "@angular/fire/compat/firestore";
import { Subject } from 'rxjs';
import { Collection } from '../data/Collection';
import { Question } from '../data/Question';


@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private collections: AngularFirestoreCollection<Collection>;
  public id_of_collection: string;
  private questions: AngularFirestoreCollection<Question>;

  private observable_Collections: Subject<Promise<Collection[]>> = new Subject();
  private observable_Questions: Subject<Promise<Question[]>> = new Subject();



  constructor(public firestore: AngularFirestore) {
    this.collections = firestore.collection<Collection>('Collection');

    const observer_Collections = this.collections.ref.onSnapshot(collectionSnapshot => {
      //console.log("Collections modified.")
      this.observable_Collections.next(this.read_collections());
    });

  }

  public subQuestions(id: string) {
    this.questions = this.collections.doc(id).collection<Question>('Question');
    const observer_Questions = this.questions.ref.onSnapshot(collectionSnapshot => {
      //console.log("Questions modified.")
      this.observable_Questions.next(this.read_questions(id));
    });
  }

  public getObservable_Collections(): Subject<Promise<Collection[]>> {
    return this.observable_Collections;
  }

  public getObservable_Questions(id): Subject<Promise<Question[]>> {
    this.subQuestions(id);
    return this.observable_Questions;
  }

  public async read_collections(): Promise<Collection[]> {
    return this.collections.get()
      .toPromise()
      .then(snapshot => snapshot.docs.map(doc => {
        const collection = doc.data();
        collection.id = doc.id;
        return collection;
      }))
      .catch(error => { console.log(error); return null; });

  }

  public async read_questions(id: string): Promise<Question[]> {
    this.questions = this.collections.doc(id).collection<Question>('Question');
    return this.questions.get()
      .toPromise()
      .then(snapshot => snapshot.docs.map(doc => {
        const collection = doc.data();
        collection.id = doc.id;
        return collection;
      }))
      .catch(error => { console.log(error); return null; });
  }
}
