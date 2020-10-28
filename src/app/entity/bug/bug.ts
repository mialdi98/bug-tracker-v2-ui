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
  status: string,
  assignetTo: User,
  description: string) {
    this.id = id;
    this.title = title;
    this.link = link;
    this.status = status;
    this.assignetTo = assignetTo;
    this.description = description;
  }
}