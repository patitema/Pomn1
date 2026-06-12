import TextField from '@mui/material/TextField';
import './Input.css';

const Input = ({
  label,
  error,
  className = '',
  ...props
}) => (
  <TextField
    className={`input-wrapper ${className}`.trim()}
    error={Boolean(error)}
    fullWidth
    helperText={error || undefined}
    label={label}
    {...props}
  />
);

export default Input;
