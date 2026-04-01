import './Loader.css';

const Loader = ({ size = 'medium' }) => (
  <div className={`loader loader--${size}`}>
    <div className="loader__spinner"></div>
  </div>
);

export default Loader;
