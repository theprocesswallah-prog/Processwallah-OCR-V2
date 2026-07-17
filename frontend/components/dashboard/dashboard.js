import './dashboard.css';
import { getCurrentSession, signOut } from '../../assets/js/services/authService.js';

export async function renderDashboardPage() {
  const app = document.getElementById('app');
  if (!app) {
    return;
  }

  const session = await getCurrentSession();
  const userEmail = session?.user?.email || 'Signed in user';

  app.innerHTML = `
    <section class="dashboard-shell" aria-label="Dashboard">
      <div class="dashboard-card">
        <h1>Dashboard</h1>
        <p>Welcome back, <strong>${userEmail}</strong>. Authentication is now enabled through the Supabase configuration layer.</p>
        <div class="dashboard-actions">
          <button id="logoutButton" class="btn-secondary" type="button">Logout</button>
        </div>
      </div>
    </section>
  `;

  document.getElementById('logoutButton')?.addEventListener('click', async () => {
    try {
      await signOut();
      window.location.hash = '';
      window.location.reload();
    } catch (error) {
      console.error('[Auth] Logout failed', error);
    }
  });
}
