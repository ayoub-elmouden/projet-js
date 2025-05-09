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

// Fetch filières from backend and populate dropdown
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const filiereSelect = document.getElementById('filiere-select');
        
        // Only attempt to fetch filières if we're on the registration page
        if (filiereSelect) {
            const response = await fetch('http://localhost:5001/api/filieres');
            
            if (!response.ok) {
                throw new Error('Failed to fetch filières');
            }
            
            const filieres = await response.json();
            
            // Clear any existing options except the placeholder
            while (filiereSelect.options.length > 1) {
                filiereSelect.options.remove(1);
            }
            
            // Add new options based on fetched data
            filieres.forEach(filiere => {
                const option = document.createElement('option');
                option.value = filiere.id || filiere._id;
                option.textContent = filiere.name;
                filiereSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error fetching filières:', error);
    }
});

// Handle registration form submission
const registerForm = document.querySelector('.form-container.sign-up form');
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nom = registerForm.querySelector('input[placeholder="Votre Nom"]').value.trim();
    const prenom = registerForm.querySelector('input[placeholder="Votre Prenom"]').value.trim();
    const email = registerForm.querySelector('input[placeholder="Email"]').value.trim();
    const password = registerForm.querySelector('input[placeholder="Mot De Passe"]').value;
    const dateNaissance = registerForm.querySelector('input[type="date"]').value;
    const filiereId = registerForm.querySelector('#filiere-select').value;
    
    // Get selected gender
    const sexeOptions = registerForm.querySelectorAll('input[name="sexe"]:checked');
    const sexe = sexeOptions.length > 0 ? sexeOptions[0].value : null;

    if (!nom || !prenom || !email || !password || !dateNaissance || !filiereId || !sexe) {
        showAlert('Please fill in all registration fields.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                nom, 
                prenom, 
                email, 
                password, 
                dateNaissance,
                sexe,
                filiereId,
                role: 'student' 
            })
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