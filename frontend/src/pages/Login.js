const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

// Helper function to show alert messages
function showAlert(message) {
    alert(message);
}

// Handle registration form submission
const registerForm = document.querySelector('.form-container.sign-up form');
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nom = registerForm.querySelector('input[placeholder="Votre Nom"]').value.trim();
    const prenom = registerForm.querySelector('input[placeholder="Votre Prenom"]').value.trim();
    const email = registerForm.querySelector('input[placeholder="Email"]').value.trim();
    const password = registerForm.querySelector('input[placeholder="Mot De Passe"]').value;

    if (!nom || !prenom || !email || !password) {
        showAlert('Please fill in all registration fields.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nom, prenom, email, password, role: 'student' })
        });

        if (!response.ok) {
            const errorData = await response.json();
            showAlert('Registration failed: ' + (errorData.message || 'Unknown error'));
            return;
        }

        showAlert('Registration successful! Please log in.');
        container.classList.remove("active"); // Switch to login form
    } catch (error) {
        showAlert('Registration error: ' + error.message);
    }
});

// Handle login form submission
const loginForm = document.querySelector('.form-container.sign-in form');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = loginForm.querySelector('input[placeholder="Email"]').value.trim();
    const password = loginForm.querySelector('input[placeholder="Mot De Passe"]').value;

    if (!email || !password) {
        showAlert('Please enter email and password.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            showAlert('Login failed: ' + (errorData.message || 'Unknown error'));
            return;
        }

        const userData = await response.json();

        // Store user data in sessionStorage
        sessionStorage.setItem('user', JSON.stringify(userData));

        // Redirect based on role
        if (userData.role === 'student') {
            window.location.href = '/student-dashboard.html';
        } else if (userData.role === 'teacher') {
            window.location.href = '/teacher-dashboard.html';
        } else {
            showAlert('Unknown user role. Cannot redirect.');
        }
    } catch (error) {
        showAlert('Login error: ' + error.message);
    }
});
