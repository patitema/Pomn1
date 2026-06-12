import MuiButton from '@mui/material/Button';
import './Button.css';

const variantMap = {
  primary: {
    muiVariant: 'contained',
    color: 'primary',
  },
  secondary: {
    muiVariant: 'contained',
    color: 'secondary',
  },
  danger: {
    muiVariant: 'contained',
    color: 'error',
  },
};

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
}) => {
  const mappedVariant = variantMap[variant] || variantMap.primary;

  return (
    <MuiButton
      className={`button button--${variant} button--${size} ${fullWidth ? 'button--full-width' : ''} ${className}`.trim()}
      color={mappedVariant.color}
      disabled={disabled}
      fullWidth={fullWidth}
      onClick={onClick}
      size={size}
      type={type}
      variant={mappedVariant.muiVariant}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
