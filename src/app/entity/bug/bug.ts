import { User } from '../user/user';

export class Bug {
  // Data.
  id: number;
  title: string;
  link: string;
  status: string;
  assignetTo: User;
  description: string;

  constructor(
  id: number,
  title: string,
  link: string,
  assignetTo: User,
  status: string,
  description: string) {
    this.id = id;
    this.title = title;
    this.link = link;
    this.assignetTo = assignetTo;
    this.status = status;
    this.description = description;
  }
}