import './index.css';
import './pages/home/HomePage.css';
import './widgets/footer/ui/Footer/Footer.css';

const renderApp = async () => {
  const [{ default: React }, { default: ReactDOM }, { App }] = await Promise.all([
    import('react'),
    import('react-dom/client'),
    import('./app'),
  ]);

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    React.createElement(React.StrictMode, null, React.createElement(App))
  );
};

if (window.location.pathname !== '/') {
  renderApp();
}
