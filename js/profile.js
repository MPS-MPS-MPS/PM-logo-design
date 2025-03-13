class ProfileManager {
    constructor() {
        this.baseUrl = 'http://localhost:5000/api';
        this.token = localStorage.getItem('token');
        console.log('ProfileManager initialized, token:', this.token); // Debug log
        
        // Initialize AuthManager if it doesn't exist
        if (!window.authManager) {
            window.authManager = new AuthManager();
        }
        
        this.setupEventListeners();
        this.checkProfileAuth();
        this.setupImageUpload();
    }

    checkProfileAuth() {
        const user = JSON.parse(localStorage.getItem('user'));
        console.log('Checking profile auth, user:', user);
        if (user && this.token) {
            this.updateProfileUI(user);
            window.authManager.updateHeaderUI(user);
            // If user has a profile picture, update all images
            if (user.profilePicUrl) {
                this.updateProfileImages(user.profilePicUrl);
            }
        } else {
            window.location.href = 'index.html';
        }
    }

    updateProfileUI(user) {
        console.log('Updating profile UI with user data:', user); // Debug log
        const profileHeader = document.querySelector('.profile-header-info');
        if (profileHeader) {
            // Update username
            const nameElement = profileHeader.querySelector('.profile-name');
            if (nameElement) {
                nameElement.textContent = user.username || '';
            }
            
            // Update institution
            const institutionElement = profileHeader.querySelector('.institution');
            if (institutionElement) {
                if (user.institution && user.institution.trim() !== '') {
                    institutionElement.textContent = user.institution;
                    institutionElement.style.display = 'block';
                    console.log('Setting institution to:', user.institution); // Debug log
                } else {
                    institutionElement.textContent = 'No institution set';
                    institutionElement.style.display = 'block';
                    console.log('No institution found in user data'); // Debug log
                }
            }
            
            // Update bio
            const bioElement = profileHeader.querySelector('.bio');
            if (bioElement) {
                bioElement.textContent = user.bio || 'No bio yet';
            }
        }

        // Update profile pictures if they exist
        if (user.profilePicUrl) {
            this.updateProfileImages(user.profilePicUrl);
        }
    }

    setupEventListeners() {
        // Edit profile button listener
        const editProfileBtn = document.querySelector('.edit-profile-btn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                this.showEditProfileModal();
            });
        }

        // Character count for bio
        const bioTextarea = document.getElementById('editBio');
        if (bioTextarea) {
            bioTextarea.addEventListener('input', () => {
                const charCount = bioTextarea.value.length;
                const charCountDisplay = document.querySelector('.char-count');
                if (charCountDisplay) {
                    charCountDisplay.textContent = `${charCount}/500`;
                }
            });
        }

        // Form validation and submission
        const editProfileForm = document.getElementById('editProfileForm');
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.validateForm()) {
                    this.updateProfile();
                }
            });
        }

        // Close modal button
        const closeBtn = document.querySelector('.edit-profile-modal .close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideEditProfileModal());
        }

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('editProfileModal');
            if (event.target === modal) {
                this.hideEditProfileModal();
            }
        });
    }

    validateForm() {
        let isValid = true;
        const username = document.getElementById('editUsername').value.trim();
        const bio = document.getElementById('editBio').value.trim();

        // Username validation
        if (username.length < 3) {
            this.showError('usernameError', 'Username must be at least 3 characters long');
            isValid = false;
        } else {
            this.hideError('usernameError');
        }

        // Bio validation
        if (bio.length > 500) {
            this.showError('bioError', 'Bio must be less than 500 characters');
            isValid = false;
        } else {
            this.hideError('bioError');
        }

        return isValid;
    }

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    hideError(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    showEditProfileModal() {
        const modal = document.getElementById('editProfileModal');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (user && modal) {
            document.getElementById('editUsername').value = user.username || '';
            document.getElementById('editInstitution').value = user.institution || '';
            document.getElementById('editBio').value = user.bio || '';
            
            // Update character count
            const bioLength = (user.bio || '').length;
            const charCountDisplay = document.querySelector('.char-count');
            if (charCountDisplay) {
                charCountDisplay.textContent = `${bioLength}/500`;
            }
            
            modal.style.display = 'block';
        }
    }

    hideEditProfileModal() {
        const modal = document.getElementById('editProfileModal');
        if (modal) {
            modal.style.display = 'none';
            // Clear any error messages
            this.hideError('usernameError');
            this.hideError('bioError');
        }
    }

    setupImageUpload() {
        const profilePicInput = document.getElementById('profilePicInput');
        if (profilePicInput) {
            profilePicInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && this.validateImage(file)) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        // Update all profile pictures immediately
                        const allProfilePics = document.querySelectorAll('.profile-pic, .profile-pic-header');
                        allProfilePics.forEach(img => {
                            img.src = e.target.result;
                            img.style.display = 'block'; // Make sure images are visible
                        });
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    validateImage(file) {
        // Check file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            alert('Image must be less than 5MB');
            return false;
        }

        // Check file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload a valid image file (JPEG, PNG, or GIF)');
            return false;
        }

        return true;
    }

    async updateProfile() {
        const username = document.getElementById('editUsername').value.trim();
        const institution = document.getElementById('editInstitution').value.trim();
        const bio = document.getElementById('editBio').value.trim();
        const profilePic = document.getElementById('profilePicInput').files[0];

        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('institution', institution);
            formData.append('bio', bio);
            if (profilePic) {
                console.log('Adding profile pic to form data:', profilePic);
                formData.append('profilePic', profilePic);
            }

            // Log the FormData contents
            for (let pair of formData.entries()) {
                console.log('FormData entry:', pair[0], pair[1]);
            }

            console.log('Token being used:', this.token);
            const response = await fetch(`${this.baseUrl}/auth/update-profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                body: formData
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            // Update localStorage with new user data
            localStorage.setItem('user', JSON.stringify(data.user));
            console.log('Updated localStorage user data:', data.user);
            
            this.updateProfileUI(data.user);
            window.authManager.updateHeaderUI(data.user);

            this.hideEditProfileModal();
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Profile update error:', error);
            alert(error.message || 'An error occurred while updating profile');
        }
    }

    updateProfileImages(profilePicUrl) {
        // If no new URL, use default image
        const imageUrl = profilePicUrl || '../assets/image-circle-fill.png';
        
        // Update all profile pictures on the page
        const allProfilePics = document.querySelectorAll('.profile-pic, .profile-pic-header');
        allProfilePics.forEach(pic => {
            pic.src = imageUrl;
            pic.style.display = 'block';
        });
    }
}

// Initialize ProfileManager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing ProfileManager'); // Debug log
    window.profileManager = new ProfileManager();
}); 