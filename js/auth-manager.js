// Only create AuthManager if it doesn't already exist
if (!window.authManager) {
    class AuthManager {
        constructor() {
            this.baseUrl = 'http://localhost:5000/api';
            this.token = localStorage.getItem('token');
            console.log('AuthManager initialized, token:', this.token);
            
            // Immediate check for auth status
            this.immediateAuthCheck();
        }

        immediateAuthCheck() {
            const user = JSON.parse(localStorage.getItem('user'));
            console.log('Immediate auth check, user:', user);
            
            // Force immediate UI update
            if (user && this.token) {
                // Update UI synchronously
                this.forceUIUpdate(user);
            } else {
                this.forceLogoutState();
            }
        }

        forceUIUpdate(user) {
            console.log('Forcing UI update with user:', user);
            
            // Hide auth buttons immediately
            const authButtons = document.getElementById('auth-buttons');
            if (authButtons) authButtons.style.display = 'none';

            // Show and update profile elements immediately
            const profileLink = document.querySelector('.profile-link');
            const profilePic = document.querySelector('.profile-pic-header');
            const logoutBtn = document.querySelector('.logout-btn');

            if (profileLink) {
                profileLink.style.display = 'flex';
                profileLink.querySelector('p').textContent = user.username;
            }

            if (profilePic) {
                profilePic.style.display = 'block';
                profilePic.src = user.profilePicUrl || '../assets/image-circle-fill.png';
            }

            if (logoutBtn) logoutBtn.style.display = 'block';
        }

        forceLogoutState() {
            console.log('Forcing logout state');
            
            // Show auth buttons immediately
            const authButtons = document.getElementById('auth-buttons');
            if (authButtons) authButtons.style.display = 'flex';

            // Hide and reset profile elements immediately
            const profileLink = document.querySelector('.profile-link');
            const profilePic = document.querySelector('.profile-pic-header');
            const logoutBtn = document.querySelector('.logout-btn');

            if (profileLink) {
                profileLink.style.display = 'none';
                profileLink.querySelector('p').textContent = '';
            }

            if (profilePic) {
                profilePic.style.display = 'none';
                profilePic.src = '../assets/image-circle-fill.png';
            }

            if (logoutBtn) logoutBtn.style.display = 'none';
        }

        updateHeaderUI(user) {
            console.log('Updating header UI with user:', user);
            
            // Update username in header
            const headerUsername = document.querySelector('.profile-link p');
            if (headerUsername) {
                headerUsername.textContent = user.username;
            }

            // Update profile picture in header
            const headerProfilePic = document.querySelector('.profile-pic-header');
            if (headerProfilePic) {
                headerProfilePic.src = user.profilePicUrl || '../assets/image-circle-fill.png';
                headerProfilePic.style.display = 'block';
            }
        }

        showLoggedInState() {
            // Hide auth buttons
            const authButtons = document.getElementById('auth-buttons');
            if (authButtons) {
                authButtons.style.display = 'none';
            }

            // Show profile elements
            const profileLink = document.querySelector('.profile-link');
            const profilePic = document.querySelector('.profile-pic-header');
            const logoutBtn = document.querySelector('.logout-btn');

            if (profileLink) profileLink.style.display = 'flex';
            if (profilePic) profilePic.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'block';
        }

        showLoggedOutState() {
            // Show auth buttons
            const authButtons = document.getElementById('auth-buttons');
            if (authButtons) {
                authButtons.style.display = 'flex';
            }

            // Hide profile elements
            const profileLink = document.querySelector('.profile-link');
            const profilePic = document.querySelector('.profile-pic-header');
            const logoutBtn = document.querySelector('.logout-btn');

            if (profileLink) profileLink.style.display = 'none';
            if (profilePic) profilePic.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
        }
    }

    // Initialize AuthManager immediately
    window.authManager = new AuthManager();

    // Add a mutation observer to handle dynamic content
    const observer = new MutationObserver((mutations) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && window.authManager.token) {
            window.authManager.forceUIUpdate(user);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
} 