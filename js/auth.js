/**
 * Revive Tu Hogar - Authentication JavaScript
 * This file handles user authentication functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication components
    initLoginForm();
    initRegisterForm();
    updateNavigation();
});

/**
 * Initialize login form functionality
 */
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form fields
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        // Clear previous alerts
        removeAlerts();

        // Validate fields
        if (!username || !password) {
            showAlert('danger', 'Por favor, complete todos los campos.');
            return;
        }

        try {
            // Send login request to API
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                showAlert('danger', data.error || 'Error al iniciar sesión');
                return;
            }

            // Store user data in sessionStorage
            sessionStorage.setItem('user_id', data.id);
            sessionStorage.setItem('username', data.username);
            
            // Redirect to home page
            window.location.href = '/';
        } catch (error) {
            console.error('Login error:', error);
            showAlert('danger', 'Error al conectar con el servidor. Por favor, inténtelo de nuevo.');
        }
    });
}

/**
 * Initialize register form functionality
 */
function initRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form fields
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        // Clear previous alerts
        removeAlerts();

        // Validate fields
        if (!username || !email || !password || !confirmPassword) {
            showAlert('danger', 'Por favor, complete todos los campos.');
            return;
        }

        // Validate email format
        if (!isValidEmail(email)) {
            showAlert('danger', 'Por favor, ingrese un correo electrónico válido.');
            return;
        }

        // Validate password match
        if (password !== confirmPassword) {
            showAlert('danger', 'Las contraseñas no coinciden.');
            return;
        }

        try {
            // Send register request to API
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                showAlert('danger', data.error || 'Error al registrar usuario');
                return;
            }

            // Show success message and redirect to login
            showAlert('success', 'Usuario registrado correctamente. Redirigiendo al inicio de sesión...');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
        } catch (error) {
            console.error('Register error:', error);
            showAlert('danger', 'Error al conectar con el servidor. Por favor, inténtelo de nuevo.');
        }
    });
}

/**
 * Update navigation based on authentication status
 */
function updateNavigation() {
    const loginLink = document.querySelector('.login-link');
    if (!loginLink) return;

    const username = sessionStorage.getItem('username');
    
    if (username) {
        // Create dropdown container
        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'user-dropdown';
        
        // Create user button
        const userButton = document.createElement('button');
        userButton.className = 'user-button';
        userButton.innerHTML = `<i class="fas fa-user"></i> ${username}`;
        
        // Create dropdown menu
        const dropdownMenu = document.createElement('div');
        dropdownMenu.className = 'dropdown-menu';
        dropdownMenu.innerHTML = `
            <a href="/html/profile.html"><i class="fas fa-id-card"></i> Perfil</a>
            <a href="#" id="logoutButton"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</a>
        `;
        
        // Add elements to DOM
        dropdownContainer.appendChild(userButton);
        dropdownContainer.appendChild(dropdownMenu);
        loginLink.parentNode.replaceChild(dropdownContainer, loginLink);
        
        // Toggle dropdown on click
        userButton.addEventListener('click', () => {
            dropdownMenu.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdownContainer.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
        
        // Handle logout
        document.getElementById('logoutButton').addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('user_id');
            sessionStorage.removeItem('username');
            window.location.reload();
        });
    } else {
        loginLink.href = 'html/login.html';
        loginLink.textContent = 'Iniciar Sesión';
    }
}

/**
 * Logout user
 */
async function logout() {
    try {
        // Send logout request to API
        const response = await fetch('/api/logout', {
            method: 'POST'
        });

        // Clear session storage
        sessionStorage.removeItem('user_id');
        sessionStorage.removeItem('username');
        
        // Redirect to home page
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

/**
 * Helper functions
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    const form = document.querySelector('.login-container form, .register-container form');
    if (form) {
        form.insertBefore(alertDiv, form.firstChild);
    }
}

function removeAlerts() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => alert.remove());
}