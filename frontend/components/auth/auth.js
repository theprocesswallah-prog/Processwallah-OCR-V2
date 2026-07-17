import './auth.css';
import { getCurrentSession, signInWithPassword, signOut, signUpWithPassword, resetPassword } from '../../assets/js/services/authService.js';

let currentView = 'login';

function setMessage(container, message, isError = false) {
  if (!container) return;
  container.textContent = message;
  container.style.color = isError ? '#b91c1c' : '#5b21b6';
}

function renderAuthShell(app, view) {
  currentView = view;
  app.innerHTML = `
    <section class="auth-shell">
      <div class="auth-card">
        <div class="auth-header">
          <h1>${view === 'signup' ? 'Create your account' : view === 'forgot' ? 'Reset your password' : 'Welcome back'}</h1>
          <p>${view === 'signup' ? 'Join Processwallah OCR V2 and continue securely.' : view === 'forgot' ? 'Enter your email to receive a recovery link.' : 'Sign in to continue to your enterprise workspace.'}</p>
        </div>

        <form id="authForm" class="auth-form" novalidate>
          <div class="auth-field">
            <label for="email">Email</label>
            <input id="email" name="email" type="email" autocomplete="email" required />
          </div>

          ${view !== 'forgot' ? `
            <div class="auth-field">
              <label for="password">Password</label>
              <input id="password" name="password" type="password" autocomplete="current-password" required />
            </div>
          ` : ''}

          ${view === 'signup' ? `
            <div class="auth-field">
              <label for="confirmPassword">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" autocomplete="new-password" required />
            </div>
          ` : ''}

          <button id="authButton" class="auth-button" type="submit">
            <span class="auth-button-label">${view === 'signup' ? 'Create account' : view === 'forgot' ? 'Send reset link' : 'Sign in'}</span>
          </button>
          <div id="authMessage" class="auth-message" role="status" aria-live="polite"></div>
        </form>

        <div class="auth-actions">
          ${view === 'login' ? '<button class="auth-link" id="switchToSignup" type="button">Create account</button>' : '<button class="auth-link" id="switchToLogin" type="button">Back to sign in</button>'}
          ${view === 'login' ? '<button class="auth-link" id="switchToForgot" type="button">Forgot password?</button>' : ''}
        </div>

        <div class="auth-footer">© 2026 Processwallah</div>
      </div>
    </section>
  `;
}

export async function renderAuthPage(view = 'login') {
  const app = document.getElementById('app');
  if (!app) return;

  renderAuthShell(app, view);

  const form = document.getElementById('authForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const authButton = document.getElementById('authButton');
  const buttonLabel = authButton.querySelector('.auth-button-label');
  const message = document.getElementById('authMessage');

  document.getElementById('switchToSignup')?.addEventListener('click', () => renderAuthPage('signup'));
  document.getElementById('switchToLogin')?.addEventListener('click', () => renderAuthPage('login'));
  document.getElementById('switchToForgot')?.addEventListener('click', () => renderAuthPage('forgot'));

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput?.value || '';
    const confirmPassword = confirmPasswordInput?.value || '';

    if (!email) {
      setMessage(message, 'Please enter your email address.', true);
      return;
    }

    if (view !== 'forgot' && !password) {
      setMessage(message, 'Please enter your password.', true);
      return;
    }

    if (view === 'signup' && password !== confirmPassword) {
      setMessage(message, 'Passwords do not match.', true);
      return;
    }

    authButton.disabled = true;
    buttonLabel.textContent = view === 'signup' ? 'Creating account...' : view === 'forgot' ? 'Sending...' : 'Signing in...';
    authButton.insertAdjacentHTML('afterbegin', '<span class="auth-spinner" aria-hidden="true"></span>');
    setMessage(message, 'Working...');

    try {
      if (view === 'signup') {
        const { data, error } = await signUpWithPassword(email, password);
        if (error) {
          setMessage(message, error.message || 'Unable to create account.', true);
        } else if (data?.session) {
          window.location.hash = '#dashboard';
          window.location.reload();
        } else {
          setMessage(message, 'Check your inbox to confirm your account.');
        }
      } else if (view === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          setMessage(message, error.message || 'Unable to send reset email.', true);
        } else {
          setMessage(message, 'A reset email has been sent.');
        }
      } else {
        const { data, error } = await signInWithPassword(email, password);
        if (error) {
          setMessage(message, error.message || 'Unable to sign in.', true);
        } else if (data?.session) {
          window.location.hash = '#dashboard';
          window.location.reload();
        } else {
          setMessage(message, 'Sign in completed but no session was returned.', true);
        }
      }
    } catch (error) {
      setMessage(message, error.message || 'Unexpected error. Please try again.', true);
    } finally {
      authButton.disabled = false;
      buttonLabel.textContent = view === 'signup' ? 'Create account' : view === 'forgot' ? 'Send reset link' : 'Sign in';
      authButton.querySelector('.auth-spinner')?.remove();
    }
  });
}
