import './Input.css';

const Input = ({
  label,
  error,
  className = '',
  ...props
}) => (
  <div className={`input-wrapper ${className}`}>
    {label && <label className="input-wrapper__label">{label}</label>}
    <input className="input-wrapper__input" {...props} />
    {error && <span className="input-wrapper__error">{error}</span>}
  </div>
);

export default Input;
