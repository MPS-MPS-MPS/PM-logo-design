// authManager
class AuthManager {
  constructor() {
    this.baseUrl = 'http://localhost:5000/api';
    this.token = localStorage.getItem('token');
    console.log('AuthManager initialized, token:', this.token); // Debug log
    this.setupEventListeners();
    this.checkAuthStatus();
  }

  setupEventListeners() {
    // Only set up auth modal listeners if we're on the main page
    if (document.getElementById('authModal')) {
      // Close button
      const closeBtn = document.querySelector('.auth-modal .close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.hideAuthModal());
      }

      // Switch between forms
      const switchToRegister = document.getElementById('switchToRegister');
      if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
          e.preventDefault();
          this.showAuthModal('register');
        });
      }

      const switchToLogin = document.getElementById('switchToLogin');
      if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
          e.preventDefault();
          this.showAuthModal('login');
        });
      }

      // Form submissions
      const loginForm = document.getElementById('loginFormElement');
      if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          await this.login();
        });
      }

      const registerForm = document.getElementById('registerFormElement');
      if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.register();
        });
      }

      // Close modal when clicking outside
      window.onclick = (event) => {
        if (event.target === document.getElementById('authModal')) {
          this.hideAuthModal();
        }
      };

      // Add login/register button listeners
      const loginBtn = document.querySelector('.login-btn');
      const registerBtn = document.querySelector('.register-btn');
      if (loginBtn) loginBtn.addEventListener('click', () => this.showAuthModal('login'));
      if (registerBtn) registerBtn.addEventListener('click', () => this.showAuthModal('register'));
    }

    // Add logout button listener (this should work on all pages)
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    }
  }

  showAuthModal(form = 'login') {
    document.getElementById('authModal').style.display = 'block';
    document.getElementById('loginForm').style.display = form === 'login' ? 'block' : 'none';
    document.getElementById('registerForm').style.display = form === 'register' ? 'block' : 'none';
  }

  hideAuthModal() {
    document.getElementById('authModal').style.display = 'none';
  }

  async login() {
    try {
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value.trim();

      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Immediately update UI before handling auth success
        this.token = data.token;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Force immediate UI update
        const profilePic = document.querySelector('.profile-pic-header');
        const profileLink = document.querySelector('.profile-link');
        const authButtons = document.getElementById('auth-buttons');
        const logoutBtn = document.querySelector('.logout-btn');

        if (profilePic) {
          profilePic.style.display = 'block';
          profilePic.src = data.user.profilePicUrl || '../assets/image-circle-fill.png';
        }
        if (profileLink) {
          profileLink.style.display = 'flex';
          profileLink.querySelector('p').textContent = data.user.username;
        }
        if (authButtons) {
          authButtons.style.display = 'none';
        }
        if (logoutBtn) {
          logoutBtn.style.display = 'block';
        }

        // Hide modal and redirect
        this.hideAuthModal();
        window.location.href = 'profile.html';
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login');
    }
  }

  async register() {
    try {
      const username = document.getElementById('registerUsername').value.trim();
      const email = document.getElementById('registerEmail').value.trim();
      const password = document.getElementById('registerPassword').value.trim();
      const institution = document.getElementById('registerInstitution').value.trim();

      console.log('Registering with data:', { username, email, institution }); // Debug log

      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          email, 
          password,
          institution 
        }),
      });

      const data = await response.json();
      console.log('Registration response:', data); // Debug log

      if (response.ok) {
        // Store complete user data in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        this.token = data.token;

        // Update UI
        this.updateHeaderUI(data.user);
        this.hideAuthModal();

        // Redirect to profile page
        window.location.href = 'profile.html';
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('An error occurred during registration');
    }
  }

  handleAuthSuccess(data) {
    console.log('Auth success, data:', data); // Debug log
    this.token = data.token;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    this.updateHeaderUI(data.user);
    this.hideAuthModal();
  }

  updateHeaderUI(user) {
    console.log('Updating header UI with user:', user);
    const profileLink = document.querySelector('.profile-div .profile-link p');
    const logoutBtn = document.querySelector('.logout-btn');
    const authButtons = document.getElementById('auth-buttons');

    if (user) {
      if (profileLink) {
        profileLink.textContent = user.username;
        profileLink.parentElement.style.display = 'block';
      }
      if (logoutBtn) logoutBtn.style.display = 'block';
      if (authButtons) authButtons.style.display = 'none';
    } else {
      if (profileLink) profileLink.parentElement.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (authButtons) authButtons.style.display = 'flex';
    }
  }

  checkAuthStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('Checking auth status, user:', user);
    if (user && this.token) {
      this.updateHeaderUI(user);
      // Notify ProfileManager if it exists
      if (window.profileManager) {
        window.profileManager.updateProfileUI(user);
      }
    } else if (window.location.pathname.includes('profile.html')) {
      window.location.href = 'index.html';
    }
  }

  handleLogout() {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token = null;

    // Reset UI elements
    const profileLink = document.querySelector('.profile-div .profile-link p');
    const logoutBtn = document.querySelector('.logout-btn');
    const authButtons = document.getElementById('auth-buttons');

    if (profileLink) {
      profileLink.textContent = '';
      profileLink.parentElement.style.display = 'none';
    }
    if (logoutBtn) {
      logoutBtn.style.display = 'none';
    }
    if (authButtons) {
      authButtons.style.display = 'flex';
    }

    // Force page reload to reset all states
    window.location.href = 'index.html';
  }

  showLoggedInState() {
    // Implementation of showLoggedInState method
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing AuthManager');
  window.authManager = new AuthManager();
});