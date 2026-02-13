import { api } from '../api.js';
import { router } from '../router.js';

export async function renderLogin() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="login-container">
            <h2>Login</h2>
            <p class="error" id="login-error" style="display: none;"></p>
            <form id="login-form">
                <div>
                    <label>Username:</label>
                    <input type="text" id="username" required />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" id="password" required />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    `;

    // Handle form submission
    const form = document.getElementById('login-form');
    const errorElement = document.getElementById('login-error');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            errorElement.style.display = 'none';
            const data = await api.login(username, password);

            if (data.user) {
                // Save user to localStorage
                localStorage.setItem('user', JSON.stringify(data.user));
                router.navigate('/dashboard');
            }
        } catch (error) {
            errorElement.textContent = error.message;
            errorElement.style.display = 'block';
        }
    });
}
