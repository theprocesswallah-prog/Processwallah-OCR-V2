import './assets/css/main.css';
import './assets/js/main.js';
import { renderAuthPage } from './components/auth/auth.js';
import { renderDashboardPage } from './components/dashboard/dashboard.js';
import { initializeSupabase } from './assets/js/services/supabaseClient.js';
import { getCurrentSession } from './assets/js/services/authService.js';

function getRouteView(route) {
  if (route === 'signup') return 'signup';
  if (route === 'forgot') return 'forgot';
  return 'login';
}

async function renderRoute() {
  const route = window.location.hash.replace('#', '').trim();
  const normalizedRoute = route.startsWith('/') ? route.slice(1) : route;
  const isDashboardRoute = normalizedRoute === 'dashboard' || normalizedRoute === '/dashboard';

  if (isDashboardRoute) {
    const session = await getCurrentSession();
    if (!session) {
      window.location.hash = '#login';
      renderAuthPage('login');
      return;
    }

    renderDashboardPage();
    return;
  }

  const view = getRouteView(normalizedRoute);
  renderAuthPage(view);
}

async function bootstrap() {
  const { client } = initializeSupabase();

  if (client) {
    const session = await getCurrentSession();
    if (session) {
      window.location.hash = '#dashboard';
      renderDashboardPage();
      return;
    }
  }

  renderRoute();
}

window.addEventListener('hashchange', () => {
  renderRoute().catch((error) => {
    console.error('[App] Route render failed', error);
  });
});

bootstrap().catch((error) => {
  console.error('[App] Bootstrap failed', error);
  renderAuthPage('login');
});

console.info('[App] Authentication-aware shell initialized');
