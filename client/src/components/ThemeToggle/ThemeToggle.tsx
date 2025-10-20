import { useContext } from 'react';
import { DarkModeContext } from '../../contexts/DarkModeContext';
import './ThemeToggle.css';

function ThemeToggle() {
  const { dark, toggleDarkMode } = useContext(DarkModeContext);

  return (
    <div className="theme-toggle-container">
      <button 
        className={`theme-toggle ${dark ? 'dark' : 'light'}`}
        onClick={toggleDarkMode}
        aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
        title={`Switch to ${dark ? 'light' : 'dark'} mode`}
      >
        <div className="theme-toggle-track">
          <div className="theme-toggle-thumb">
            <span className="theme-icon">
              {dark ? '🌙' : '☀️'}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}

export default ThemeToggle;
