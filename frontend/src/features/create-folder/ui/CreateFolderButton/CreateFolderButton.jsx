import { Button } from '../../../../shared/ui';
import './CreateFolderButton.css';

const CreateFolderButton = ({ onClick, className = '' }) => (
  <Button 
    onClick={onClick} 
    className={`create-folder-button ${className}`}
  >
    <span className="create-folder-button__icon">📁</span>
    <span className="create-folder-button__text">Создать папку</span>
  </Button>
);

export default CreateFolderButton;
