import { CollInterface } from './CollInterface';

export class Collection implements CollInterface {
    id: string;
    author: string;
    title: string;
    visibility: string;
    completedBy: string[];
    date: Date;

    constructor(author: string, title: string, visibility: string, completedBy: string[], date: Date) {
        this.author = author;
        this.title = title;
        this.visibility = visibility;
        this.completedBy = completedBy;
        this.date = date;
    }

}