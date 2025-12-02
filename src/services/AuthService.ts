import type { User, UserSession } from '../types';

class AuthService {
  private readonly USERS_KEY = 'chatbot_users';
  private readonly SESSION_KEY = 'chatbot_session';

  /**
   * Hash a password using SHA-256 with a salt
   * Note: This is client-side only for educational purposes.
   * In production, use proper backend authentication.
   */
  async hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
    const actualSalt = salt || this.generateSalt();
    const encoder = new TextEncoder();
    const data = encoder.encode(password + actualSalt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return { hash, salt: actualSalt };
  }

  /**
   * Generate a random salt
   */
  private generateSalt(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate a unique user ID
   */
  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get all users from localStorage
   */
  private getUsers(): User[] {
    const usersJson = localStorage.getItem(this.USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  /**
   * Save users to localStorage
   */
  private saveUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  /**
   * Find a user by username
   */
  private findUserByUsername(username: string): User | undefined {
    const users = this.getUsers();
    return users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  /**
   * Register a new user
   */
  async register(username: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    // Validate input
    if (!username || username.trim().length < 3) {
      return { success: false, error: 'Username must be at least 3 characters long' };
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }

    // Check if username already exists
    if (this.findUserByUsername(username)) {
      return { success: false, error: 'Username already exists' };
    }

    // Hash password
    const { hash, salt } = await this.hashPassword(password);
    const passwordHash = `${salt}:${hash}`;

    // Create new user
    const newUser: User = {
      id: this.generateUserId(),
      username: username.trim(),
      passwordHash,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    // Save user
    const users = this.getUsers();
    users.push(newUser);
    this.saveUsers(users);

    return { success: true, user: newUser };
  }

  /**
   * Login a user
   */
  async login(username: string, password: string): Promise<{ success: boolean; error?: string; session?: UserSession }> {
    // Validate input
    if (!username || !password) {
      return { success: false, error: 'Username and password are required' };
    }

    // Find user
    const user = this.findUserByUsername(username);
    if (!user) {
      return { success: false, error: 'Invalid username or password' };
    }

    // Verify password
    const [salt, storedHash] = user.passwordHash.split(':');
    const { hash } = await this.hashPassword(password, salt);

    if (hash !== storedHash) {
      return { success: false, error: 'Invalid username or password' };
    }

    // Update last login
    user.lastLoginAt = new Date().toISOString();
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = user;
      this.saveUsers(users);
    }

    // Create session
    const session: UserSession = {
      userId: user.id,
      username: user.username,
      loginAt: new Date().toISOString(),
    };

    // Save session
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

    return { success: true, session };
  }

  /**
   * Logout the current user
   */
  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  /**
   * Get the current user session
   */
  getCurrentSession(): UserSession | null {
    const sessionJson = localStorage.getItem(this.SESSION_KEY);
    return sessionJson ? JSON.parse(sessionJson) : null;
  }

  /**
   * Check if a user is currently logged in
   */
  isAuthenticated(): boolean {
    return this.getCurrentSession() !== null;
  }
}

export const authService = new AuthService();
