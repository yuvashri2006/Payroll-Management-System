import { api } from '../api.js';
import { router } from '../router.js';

export async function renderLogin() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="login-page-wrapper">
            <div class="login-container">
                <h2>Welcome</h2>
                <div id="login-error" class="error-box" style="display: none;">
                    <i data-lucide="alert-circle" style="width: 18px"></i>
                    <span id="error-message"></span>
                </div>
                <form id="login-form">
                    <div class="form-group">
                        <label>Login As</label>
                        <select id="role" class="form-control" style="width: 100%; padding: 0.75rem; border-radius: var(--radius); border: 1px solid var(--border); background: var(--bg-main); font-family: inherit;">
                            <option value="admin">Administrator</option>
                            <option value="employee">Employee</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label id="username-label">Username</label>
                        <input type="text" id="username" placeholder="Admin username or Employee Full Name" required />
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="password" required />
                    </div>
                    <div class="button-container">
                        <button type="submit" class="btn btn-primary">
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Initialize icons
    if (window.lucide) window.lucide.createIcons();

    // Handle form submission
    const form = document.getElementById('login-form');
    const errorBox = document.getElementById('login-error');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const role = document.getElementById('role').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            errorBox.style.display = 'none';
            const data = await api.login(username, password, role);

            if (data.user) {
                // Save user to localStorage
                localStorage.setItem('user', JSON.stringify(data.user));
                router.navigate('/dashboard');
            }
        } catch (error) {
            document.getElementById('error-message').textContent = error.message;
            errorBox.style.display = 'flex';
        }
    });
}
