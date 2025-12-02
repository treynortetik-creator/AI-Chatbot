export interface User {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface UserSession {
  userId: string;
  username: string;
  loginAt: string;
}
