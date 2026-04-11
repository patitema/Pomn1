import './TasksPage.css';

const TasksPage = () => {
  return (
    <div className="page-container page-container--centered">
      <div className="tasks-container">
        <h1 className="tasks-title">Задачи</h1>
        <div className="tasks-placeholder">
          <span className="tasks-icon">🚧</span>
          <p>Страница в разработке</p>
          <p className="tasks-subtitle">
            Скоро здесь появится управление задачами
          </p>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
