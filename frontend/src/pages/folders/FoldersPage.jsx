import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../entities/user';
import { selectAllFolders } from '../../entities/folder';
import { FolderCard } from '../../entities/folder';
import { CreateFolderForm, CreateFolderButton } from '../../features/create-folder';
import { EditFolderModal } from '../../features/update-folder';
import { routes } from '../../shared/config';
import './FoldersPage.css';

const FoldersPage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const folders = useSelector(selectAllFolders);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);

  if (!isAuthenticated) {
    return <Navigate to={routes.auth} replace />;
  }

  return (
    <div className="page-container">
      <div className="folders-container">
        <div className="folders-header">
          <h1 className="folders-title">Папки</h1>
          <CreateFolderButton onClick={() => setIsCreateModalOpen(true)} />
        </div>

        <div className="folders-grid">
          {folders.length === 0 ? (
            <p className="folders-empty">Нет папок</p>
          ) : (
            folders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onEdit={setEditingFolder}
              />
            ))
          )}
        </div>
      </div>

      <CreateFolderForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <EditFolderModal
        folder={editingFolder}
        isOpen={!!editingFolder}
        onClose={() => setEditingFolder(null)}
      />
    </div>
  );
};

export default FoldersPage;
