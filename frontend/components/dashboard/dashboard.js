import './dashboard.css';
import { renderDashboardApp } from './DashboardApp.jsx';

export function renderDashboardPage() {
  const app = document.getElementById('app');
  if (!app) {
    return;
  }

  app.innerHTML = '';
  renderDashboardApp(app);
}
