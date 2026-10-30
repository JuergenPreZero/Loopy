export class UserValidator {
  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  validateName(name: string, fieldName = 'Name'): string | null {
    if (!name || name.trim().length === 0) {
      return `${fieldName} darf nicht leer sein.`;
    }
    return null;
  }

  validateEmail(email: string): string | null {
    const trimmed = email ? email.trim() : '';
    if (!trimmed) {
      return 'Bitte gib deine E-Mail-Adresse ein.';
    }
    if (!this.emailRegex.test(trimmed)) {
      return 'Bitte gib eine gültige E-Mail-Adresse ein.';
    }
    return null;
  }

  validatePassword(password: string): string | null {
    if (!password || password.length < 8) {
      return 'Passwort muss mindestens 8 Zeichen lang sein.';
    }
    return null;
  }
}

export const validator = new UserValidator();