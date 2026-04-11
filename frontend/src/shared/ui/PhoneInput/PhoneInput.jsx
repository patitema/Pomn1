import './PhoneInput.css';

/**
 * Маска телефона: форматирует ввод в формат +7 (XXX) XXX-XX-XX
 * Принимает только цифры.
 */

const DIGITS_ONLY = /[^0-9]/g;

/**
 * Форматирует строку цифр в телефонный формат.
 * "79991234567" → "+7(999)-123-45-67"
 */
export function formatPhone(value) {
  const digits = value.replace(DIGITS_ONLY, '');
  let clean = digits;

  if (clean.length === 0) return '';
  if (clean[0] !== '7') {
    clean = '7' + clean;
  }
  clean = clean.slice(0, 11);

  let result = '+7';
  if (clean.length > 1) result += '(' + clean.slice(1, 4);
  if (clean.length >= 4) result += ')';
  if (clean.length > 4) result += '-' + clean.slice(4, 7);
  if (clean.length > 7) result += '-' + clean.slice(7, 9);
  if (clean.length > 9) result += '-' + clean.slice(9, 11);

  return result;
}

/**
 * Извлекает чистые цифры из форматированной строки.
 */
export function unformatPhone(value) {
  return value.replace(DIGITS_ONLY, '');
}

const PhoneInput = ({ value = '', onChange, placeholder, label, error, name = 'phone_number' }) => {
  // value — чистые цифры от родителя (controlled)
  // Показываем отформатированную версию
  const displayValue = value ? formatPhone(value) : '';

  const handleChange = (e) => {
    const raw = e.target.value;
    const digits = unformatPhone(raw);
    // Наверх отдаём чистые цифры
    onChange({ target: { name, value: digits } });
  };

  return (
    <div className={`phone-input ${error ? 'phone-input--error' : ''}`}>
      {label && <label className="phone-input__label">{label}</label>}
      <input
        type="tel"
        className="phone-input__input"
        name={name}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder || '+7(XXX)-XXX-XX-XX'}
        inputMode="numeric"
      />
      {error && <span className="phone-input__error">{error}</span>}
    </div>
  );
};

export default PhoneInput;
