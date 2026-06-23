import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import './Modal.css';

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  className = '',
}) => (
  <Dialog
    open={isOpen}
    onClose={onClose}
    slotProps={{
      container: {
        className: 'modal__container',
      },
      paper: {
        className: `modal ${className}`.trim(),
        sx: {
          backgroundColor: '#222222',
          backgroundImage: 'none',
        },
      },
    }}
  >
    {title && <DialogTitle className="modal__title">{title}</DialogTitle>}
    <IconButton
      className="modal__close"
      onClick={onClose}
      aria-label="Закрыть"
      sx={{
        position: 'absolute',
        top: 12,
        right: 12,
        left: 'auto',
        width: 32,
        height: 32,
        minWidth: 32,
        padding: '4px',
        display: 'inline-flex',
        backgroundColor: 'transparent',
        color: '#ffffff',
        zIndex: 1,
        '&:hover': {
          backgroundColor: 'transparent',
          color: '#FEB7FF',
        },
      }}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
    <DialogContent className="modal__content">
      {children}
    </DialogContent>
  </Dialog>
);

export default Modal;
