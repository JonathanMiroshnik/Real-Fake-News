import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import SiteConfiguration from './pages/SiteConfiguration';
import ArticleEditor from './pages/ArticleEditor';
import CronJobs from './pages/CronJobs';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/config" element={<SiteConfiguration />} />
          <Route path="/cron" element={<CronJobs />} />
          <Route path="/articles/edit/:key" element={<ArticleEditor />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
