import { formatPhone, unformatPhone } from './PhoneInput';

describe('PhoneInput utils', () => {
  describe('formatPhone', () => {
    it('should return empty string for empty input', () => {
      expect(formatPhone('')).toBe('');
    });

    it('should format 79991234567 to +7(999)-123-45-67', () => {
      expect(formatPhone('79991234567')).toBe('+7(999)-123-45-67');
    });

    it('should add 7 prefix if not present', () => {
      expect(formatPhone('9991234567')).toBe('+7(999)-123-45-67');
    });

    it('should format partial input: 7', () => {
      expect(formatPhone('7')).toBe('+7');
    });

    it('should format partial input: 79', () => {
      expect(formatPhone('79')).toBe('+7(9');
    });

    it('should format partial input: 7999', () => {
      expect(formatPhone('7999')).toBe('+7(999)');
    });

    it('should format partial input: 79991', () => {
      expect(formatPhone('79991')).toBe('+7(999)-1');
    });

    it('should format partial input: 7999123', () => {
      expect(formatPhone('7999123')).toBe('+7(999)-123');
    });

    it('should format partial input: 79991234', () => {
      expect(formatPhone('79991234')).toBe('+7(999)-123-4');
    });

    it('should format partial input: 799912345', () => {
      expect(formatPhone('799912345')).toBe('+7(999)-123-45');
    });

    it('should truncate to 11 digits', () => {
      expect(formatPhone('79991234567890')).toBe('+7(999)-123-45-67');
    });

    it('should strip non-digit characters', () => {
      expect(formatPhone('abc7def999ghi123jkl4567')).toBe('+7(999)-123-45-67');
    });
  });

  describe('unformatPhone', () => {
    it('should extract digits from formatted string', () => {
      expect(unformatPhone('+7(999)-123-45-67')).toBe('79991234567');
    });

    it('should handle partial formatted input', () => {
      expect(unformatPhone('+7(999)-12')).toBe('799912');
    });

    it('should return same string if no formatting', () => {
      expect(unformatPhone('79991234567')).toBe('79991234567');
    });
  });
});
