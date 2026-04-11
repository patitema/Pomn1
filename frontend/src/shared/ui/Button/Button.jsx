import './Button.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => (
  <button
    className={`button button--${variant} button--${size} ${fullWidth ? 'button--full-width' : ''} ${className}`}
    disabled={disabled}
    onClick={onClick}
    type={type}
    {...props}
  >
    {children}
  </button>
);

export default Button;
