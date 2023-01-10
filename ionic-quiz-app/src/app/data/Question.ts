import { QuesInterface } from './QuesInterface';

type AnswerRange = 1 | 2 | 3 | 4;

export class Question implements QuesInterface {
    id: string;
    text: string;
    qNumber: number;
    answers: [string, string, string, string];
    correct_answer: AnswerRange;
    solved: boolean;
    counter: number;

    constructor(text: string, qNumber: number, answers: [string, string, string, string], correct_answer: AnswerRange, solved: boolean) {
        this.text = text;
        this.qNumber = qNumber;
        this.answers = answers;
        this.correct_answer = correct_answer;
        this.solved = solved;
    }

}