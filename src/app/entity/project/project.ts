import { User } from '../user/user';

export class Project {
  // Data.
  id: number;
  title: string;
  assignetTo: User;
  members: Array<User>;

  constructor(id: number, title: string, assignetTo: User, members: User[] = []) {
    this.id = id;
    this.title = title;
    this.assignetTo = assignetTo;
    this.members = members ?? [];
  }
}