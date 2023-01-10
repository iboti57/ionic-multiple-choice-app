type AnswerRange = 1 | 2 | 3 | 4;

export interface QuesInterface {
    id: string;
    text: string;
    answers: [string, string, string, string];
    correct_answer: AnswerRange;
    solved: boolean;
}