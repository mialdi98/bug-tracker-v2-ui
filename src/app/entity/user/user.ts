export class User {
  id: number;
  username: string;
  role: string;

  constructor(id: number, username: string, role: string) {
    this.id = id;
    this.username = username;
    this.role = role;
  }

  isRole(role) {
    if (this.role === role) {
      return true;
    }
    else {
      return false;
    }
  }
}