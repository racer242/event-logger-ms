/**
 * Маскирование персональных данных согласно ТЗ
 */

export class DataMaskingService {
  /**
   * Маскирование телефона: +7 (999) 123-45-67 -> +7 (***) ***-**-67
   */
  static maskPhone(phone: string): string {
    if (!phone) return phone;
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) return phone;
    
    // Оставляем последние 2 цифры
    const lastTwo = digits.slice(-2);
    return phone.replace(/\d(?=\d)/g, '*');
  }

  /**
   * Маскирование email: user@example.com -> u**@example.com
   */
  static maskEmail(email: string): string {
    if (!email || !email.includes('@')) return email;
    
    const [username, domain] = email.split('@');
    if (username.length <= 2) {
      return `**@${domain}`;
    }
    
    const firstChar = username.charAt(0);
    const masked = firstChar + '*'.repeat(Math.min(username.length - 1, 5));
    return `${masked}@${domain}`;
  }

  /**
   * Псевдонимизация IP-адреса: 192.168.1.100 -> 192.168.1.**
   */
  static maskIp(ip: string): string {
    if (!ip) return ip;
    
    const parts = ip.split('.');
    if (parts.length !== 4) return ip;
    
    parts[3] = '**';
    return parts.join('.');
  }

  /**
   * Маскирование паспортных данных
   */
  static maskPassport(passport: string): string {
    if (!passport) return passport;
    const digits = passport.replace(/\D/g, '');
    if (digits.length < 4) return '****';
    
    const lastFour = digits.slice(-4);
    return `****${lastFour}`;
  }

  /**
   * Маскирование банковских карт
   */
  static maskCard(card: string): string {
    if (!card) return card;
    const digits = card.replace(/\D/g, '');
    if (digits.length < 4) return '****';
    
    const lastFour = digits.slice(-4);
    return `**** **** **** ${lastFour}`;
  }

  /**
   * Рекурсивное маскирование полей в объекте
   */
  static maskObject(obj: Record<string, unknown>): {
    masked: Record<string, unknown>;
    maskedFields: Record<string, string>;
  } {
    const masked: Record<string, unknown> = {};
    const maskedFields: Record<string, string> = {};

    const phonePatterns = ['phone', 'telephone', 'mobile', 'cell'];
    const emailPatterns = ['email', 'mail', 'e-mail'];
    const ipPatterns = ['ip', 'ip_address', 'ipaddress', 'remote_ip'];
    const passportPatterns = ['passport', 'паспорт'];
    const cardPatterns = ['card', 'credit_card', 'creditcard', 'банковская'];

    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();

      if (typeof value === 'string') {
        if (phonePatterns.some((p) => lowerKey.includes(p))) {
          masked[key] = this.maskPhone(value);
          maskedFields[key] = 'phone';
          continue;
        }

        if (emailPatterns.some((p) => lowerKey.includes(p))) {
          masked[key] = this.maskEmail(value);
          maskedFields[key] = 'email';
          continue;
        }

        if (ipPatterns.some((p) => lowerKey.includes(p))) {
          masked[key] = this.maskIp(value);
          maskedFields[key] = 'ip';
          continue;
        }

        if (passportPatterns.some((p) => lowerKey.includes(p))) {
          masked[key] = this.maskPassport(value);
          maskedFields[key] = 'passport';
          continue;
        }

        if (cardPatterns.some((p) => lowerKey.includes(p))) {
          masked[key] = this.maskCard(value);
          maskedFields[key] = 'card';
          continue;
        }
      }

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const nested = this.maskObject(value as Record<string, unknown>);
        masked[key] = nested.masked;
        for (const [nk, nv] of Object.entries(nested.maskedFields)) {
          maskedFields[`${key}.${nk}`] = nv;
        }
        continue;
      }

      masked[key] = value;
    }

    return { masked, maskedFields };
  }
}
