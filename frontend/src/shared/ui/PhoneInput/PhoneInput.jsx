import './PhoneInput.css';

const DIGITS_ONLY = /[^0-9]/g;
const MAX_PHONE_DIGITS = 11;

export function unformatPhone(value) {
  return value.replace(DIGITS_ONLY, '');
}

export function normalizePhoneDigits(value) {
  const digits = unformatPhone(value);
  if (!digits) return '';

  const prefixedDigits = digits[0] === '7' ? digits : `7${digits}`;
  return prefixedDigits.slice(0, MAX_PHONE_DIGITS);
}

export function formatPhone(value) {
  let clean = normalizePhoneDigits(value);

  if (clean.length === 0) return '';

  let result = '+7';
  if (clean.length > 1) result += '(' + clean.slice(1, 4);
  if (clean.length >= 4) result += ')';
  if (clean.length > 4) result += '-' + clean.slice(4, 7);
  if (clean.length > 7) result += '-' + clean.slice(7, 9);
  if (clean.length > 9) result += '-' + clean.slice(9, MAX_PHONE_DIGITS);

  return result;
}

const PhoneInput = ({ value = '', onChange, placeholder, label, error, name = 'phone_number' }) => {
  const displayValue = value ? formatPhone(value) : '';

  const handleChange = (e) => {
    const raw = e.target.value;
    const digits = normalizePhoneDigits(raw);
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
        aria-label={label || placeholder || 'Телефон'}
        inputMode="numeric"
      />
      {error && <span className="phone-input__error">{error}</span>}
    </div>
  );
};

export default PhoneInput;
