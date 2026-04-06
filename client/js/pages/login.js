import { api } from '../api.js';
import { router } from '../router.js';

export async function renderLogin() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="login-page-wrapper fade-in" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at top right, var(--primary-light), transparent), radial-gradient(circle at bottom left, rgba(99, 102, 241, 0.05), transparent); background-color: var(--bg-main);">
            <div class="login-container" style="width: 100%; max-width: 440px; padding: 3rem; background: var(--glass-bg); backdrop-filter: var(--glass-blur); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); box-shadow: var(--shadow-premium);">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="margin: 0 auto 1.5rem; width: 64px; height: 64px; background: linear-gradient(135deg, var(--primary), #a855f7); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);">
                        <i data-lucide="shield-check" style="width: 32px; height: 32px;"></i>
                    </div>
                </div>

                <div id="login-error" class="error-box" style="display: none; background: #fef2f2; border: 1px solid #fee2e2; color: var(--error); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 2rem; align-items: center; gap: 0.75rem; font-size: 0.875rem; font-weight: 600;">
                    <i data-lucide="alert-circle" style="width: 18px"></i>
                    <span id="error-message"></span>
                </div>

                <div style="margin-bottom: 2.5rem; background: var(--bg-main); padding: 0.5rem; border-radius: var(--radius-md); display: flex; gap: 0.5rem; border: 1px solid var(--border);">
                    <button type="button" id="role-admin" class="btn active" style="flex: 1; border-radius: var(--radius-sm); font-size: 0.875rem; font-weight: 600; padding: 0.75rem; transition: all 0.2s;">Administrator</button>
                    <button type="button" id="role-employee" class="btn" style="flex: 1; border-radius: var(--radius-sm); font-size: 0.875rem; font-weight: 600; padding: 0.75rem; transition: all 0.2s;">Employee</button>
                </div>

                <form id="login-form">
                    <input type="hidden" id="role" value="admin" />
                    <div class="form-group" style="margin-bottom: 1.5rem;">
                        <label id="username-label" style="display: block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 0.5rem;">Admin Credential</label>
                        <div style="position: relative;">
                            <i data-lucide="user" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); width: 18px; color: var(--text-muted);"></i>
                            <input type="text" id="username" placeholder="Full Name or Username" required style="width: 100%; padding: 0.875rem 1rem 0.875rem 3rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); font-family: inherit; font-size: 1rem; transition: all 0.2s;" />
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom: 2rem;">
                        <label style="display: block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 0.5rem;">Security Key</label>
                        <div style="position: relative;">
                            <i data-lucide="lock" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); width: 18px; color: var(--text-muted);"></i>
                            <input type="password" id="password" placeholder="••••••••" required style="width: 100%; padding: 0.875rem 1rem 0.875rem 3rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); font-family: inherit; font-size: 1rem; transition: all 0.2s;" />
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary" style="width: 100%; padding: 1rem; font-size: 1rem; font-weight: 700; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; gap: 0.75rem; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);">
                        Establish Secure Connection <i data-lucide="arrow-right" style="width: 18px"></i>
                    </button>
                </form>

                <div style="margin-top: 2.5rem; text-align: center; border-top: 1px solid var(--border); pt: 2rem;">
                    <p style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-top: 1.5rem;">
                        <i data-lucide="shield" style="width: 12px; color: var(--primary);"></i> 
                        Protected by Enterprise Security Standards
                    </p>
                </div>
            </div>
        </div>

        <style>
            .login-container .btn:not(.btn-primary).active {
                background: white;
                color: var(--secondary);
                box-shadow: var(--shadow-sm);
            }
            .login-container .btn:not(.btn-primary):not(.active) {
                background: transparent;
                color: var(--text-muted);
            }
            input:focus {
                outline: none;
                border-color: var(--primary) !important;
                box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
            }
        </style>
    `;

    // Initialize icons
    if (window.lucide) window.lucide.createIcons();

    const roleInput = document.getElementById('role');
    const adminTab = document.getElementById('role-admin');
    const empTab = document.getElementById('role-employee');
    const usernameInput = document.getElementById('username');
    const label = document.getElementById('username-label');

    const updateUI = (role) => {
        roleInput.value = role;
        if (role === 'admin') {
            adminTab.classList.add('active');
            empTab.classList.remove('active');
            usernameInput.placeholder = "Administrator Identifier";
            label.textContent = "Admin Credential";
        } else {
            empTab.classList.add('active');
            adminTab.classList.remove('active');
            usernameInput.placeholder = "Employee Legal Name";
            label.textContent = "Corporate Identity";
        }
    };

    adminTab.addEventListener('click', () => updateUI('admin'));
    empTab.addEventListener('click', () => updateUI('employee'));

    // Handle URL parameters for restricted view
    const urlParams = new URLSearchParams(window.location.search);
    const forcedRole = urlParams.get('role');
    if (forcedRole === 'employee') {
        updateUI('employee');
        adminTab.style.display = 'none';
        empTab.style.width = '100%';
        adminTab.parentElement.style.justifyContent = 'center';
    }

    // Handle form submission
    const form = document.getElementById('login-form');
    const errorBox = document.getElementById('login-error');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const role = roleInput.value;
        const username = usernameInput.value;
        const password = document.getElementById('password').value;

        try {
            errorBox.style.display = 'none';
            const data = await api.login(username, password, role);

            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
                router.navigate('/dashboard');
            }
        } catch (error) {
            document.getElementById('error-message').textContent = error.message;
            errorBox.style.display = 'flex';
        }
    });
}
