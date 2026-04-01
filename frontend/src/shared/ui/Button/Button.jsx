import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => (
  <button
    className={`button button--${variant} button--${size} ${className}`}
    disabled={disabled}
    onClick={onClick}
    type={type}
    {...props}
  >
    {children}
  </button>
);

export default Button;
