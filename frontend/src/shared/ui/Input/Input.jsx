import TextField from '@mui/material/TextField';
import './Input.css';

const Input = ({
  label,
  error,
  className = '',
  slotProps,
  ...props
}) => (
  <TextField
    className={`input-wrapper ${className}`.trim()}
    error={Boolean(error)}
    fullWidth
    helperText={error || undefined}
    label={label}
    slotProps={{
      ...slotProps,
      input: {
        'aria-label': props['aria-label'] || label || props.placeholder,
        ...slotProps?.input,
      },
    }}
    {...props}
  />
);

export default Input;
