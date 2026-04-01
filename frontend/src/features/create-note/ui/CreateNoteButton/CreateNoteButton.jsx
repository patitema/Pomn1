import { Button } from '../../../../shared/ui';
import './CreateNoteButton.css';

const CreateNoteButton = ({ onClick, className = '' }) => (
  <Button 
    onClick={onClick} 
    className={`create-note-button ${className}`}
  >
    <span className="create-note-button__icon">+</span>
    <span className="create-note-button__text">Создать заметку</span>
  </Button>
);

export default CreateNoteButton;
