import './login.css';
import { signInWithPassword } from '../../assets/js/services/authService.js';

export function renderLoginPage() {
  const app = document.getElementById('app');
  if (!app) {
    return;
  }

  app.innerHTML = `
    <section class="login-shell" aria-label="Login section">
      <div class="login-hero">
        <div class="login-brand">
          <div class="logo-mark" aria-hidden="true">
            <svg viewBox="0 0 64 64" role="img" aria-label="Processwallah logo">
              <rect x="8" y="8" width="22" height="22" rx="6" fill="#ffffff"></rect>
              <rect x="34" y="8" width="22" height="22" rx="6" fill="#ffffff" opacity="0.9"></rect>
              <rect x="8" y="34" width="22" height="22" rx="6" fill="#ffffff" opacity="0.95"></rect>
              <rect x="34" y="34" width="22" height="22" rx="6" fill="#ffffff" opacity="0.8"></rect>
            </svg>
          </div>
          <span>Processwallah OCR V2</span>
        </div>

        <div class="hero-copy">
          <h1>Unlock intelligent document workflows.</h1>
          <p>Secure access to your OCR operations, business records, and enterprise automation workspace.</p>
          <div class="hero-badge">⚡ Enterprise-ready access</div>
          <div class="version-pill">OCR Engine V2.0</div>
        </div>

        <div></div>
      </div>

      <div class="login-panel">
        <div class="login-card">
          <h2>Welcome back</h2>
          <p>Sign in to continue to your workspace.</p>

          <form id="loginForm" novalidate>
            <div class="form-group">
              <label for="email">Email address</label>
              <div class="input-wrap">
                <span class="input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm0 2 8 5 8-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </span>
                <input id="email" name="email" type="email" placeholder="name@company.com" autocomplete="email" required aria-describedby="emailHint" />
              </div>
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <div class="input-wrap">
                <input id="password" name="password" type="password" placeholder="Enter your password" autocomplete="current-password" required />
                <button class="toggle-password" type="button" id="togglePassword" aria-label="Show password">Show</button>
              </div>
            </div>

            <div class="helper-row">
              <label class="checkbox-wrap" for="rememberMe">
                <input type="checkbox" id="rememberMe" />
                <span>Remember me</span>
              </label>
              <button class="link-btn" type="button">Forgot password?</button>
            </div>

            <button class="btn-primary" id="submitButton" type="submit" aria-live="polite">
              <span class="btn-label">Sign In</span>
            </button>
            <div class="form-message" id="formMessage" role="status" aria-live="polite"></div>
          </form>

          <footer class="login-footer">© 2026 Processwallah</footer>
        </div>
      </div>
    </section>
  `;

  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const togglePassword = document.getElementById('togglePassword');
  const submitButton = document.getElementById('submitButton');
  const buttonLabel = submitButton.querySelector('.btn-label');
  const formMessage = document.getElementById('formMessage');

  togglePassword?.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    togglePassword.textContent = isHidden ? 'Hide' : 'Show';
    togglePassword.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      formMessage.textContent = 'Please enter both email and password.';
      return;
    }

    submitButton.classList.add('is-loading');
    submitButton.disabled = true;
    buttonLabel.textContent = 'Signing In...';
    submitButton.insertAdjacentHTML('afterbegin', '<span class="btn-spinner" aria-hidden="true"></span>');
    formMessage.textContent = 'Preparing your secure workspace...';

    try {
      const { data, error } = await signInWithPassword(email, password);
      if (error) {
        formMessage.textContent = error.message || 'Unable to sign in.';
      } else if (data?.session) {
        window.location.hash = '#dashboard';
        window.location.reload();
      } else {
        formMessage.textContent = 'Authentication succeeded but no session was returned.';
      }
    } catch (error) {
      formMessage.textContent = error.message || 'Unexpected authentication error.';
    } finally {
      submitButton.classList.remove('is-loading');
      submitButton.disabled = false;
      buttonLabel.textContent = 'Sign In';
      submitButton.querySelector('.btn-spinner')?.remove();
    }
  });
}
