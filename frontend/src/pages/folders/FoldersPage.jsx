import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@entities/user';
import { selectAllFolders } from '@entities/folder';
import { FolderCard } from '@entities/folder';
import { CreateFolderButton } from '@features/create-folder';
import { EditFolderModal } from '@features/update-folder';
import { Header } from '@widgets/header';
import { Footer } from '@widgets/footer';
import { routes } from '@shared/config';
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
    <div className="folders-page">
      <Header />
      
      <main className="folders-page__content">
        <div className="folders-page__header">
          <h1 className="folders-page__title">Папки</h1>
          <CreateFolderButton onClick={() => setIsCreateModalOpen(true)} />
        </div>
        
        <div className="folders-page__grid">
          {folders.length === 0 ? (
            <p className="folders-page__empty">Нет папок</p>
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
      </main>
      
      <EditFolderModal
        folder={editingFolder}
        isOpen={!!editingFolder}
        onClose={() => setEditingFolder(null)}
      />
      
      <Footer />
    </div>
  );
};

export default FoldersPage;
