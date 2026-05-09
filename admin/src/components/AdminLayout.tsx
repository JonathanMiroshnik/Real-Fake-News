import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/config', label: 'Config', icon: '⚙️' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  function isActive(path: string): boolean {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '';
    }
    return location.pathname.startsWith(path);
  }

  function handleNavigate(path: string) {
    const params = new URLSearchParams(location.search);
    const pwd = params.get('pwd');
    const target = pwd ? `${path}?pwd=${encodeURIComponent(pwd)}` : path;
    navigate(target);
  }

  return (
    <div className="admin-layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h1>Admin Panel</h1>
          <p className="subtitle">Content Management</p>
        </div>
        <ul className="nav-list">
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <button
                className={`nav-item${isActive(item.path) ? ' active' : ''}`}
                onClick={() => handleNavigate(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
