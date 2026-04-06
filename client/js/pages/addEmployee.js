import { api } from '../api.js';
import { router } from '../router.js';

export async function renderAddEmployee() {
    const app = document.getElementById('app');

    // Check authentication
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        router.navigate('/');
        return;
    }

    const today = new Date().toISOString().split('T')[0];

    app.innerHTML = `
        <div class="dashboard-container">
            <div class="dashboard-header">
                <div class="header-info">
                    <h1>New Employee</h1>
                    <p>Enter the details to add a new member to the team.</p>
                </div>
            </div>

            <div class="form-container">
                <div id="add-employee-error" class="error-box" style="display: none;">
                    <i data-lucide="alert-circle" style="width: 18px"></i>
                    <span id="error-message"></span>
                </div>
                <form id="add-employee-form" class="add-employee-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>First Name</label>
                            <input type="text" id="first-name" placeholder="John" required />
                        </div>
                        <div class="form-group">
                            <label>Last Name</label>
                            <input type="text" id="last-name" placeholder="Doe" required />
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" id="email" placeholder="john.doe@company.com" required />
                    </div>

                    <div class="form-group">
                        <label>Job Position</label>
                        <input type="text" id="position" placeholder="Software Engineer" required />
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label>Annual Package (LPA)</label>
                            <input type="number" id="salary" placeholder="5.5" min="0" step="any" required />
                        </div>
                        <div class="form-group">
                            <label>Date Hired</label>
                            <input type="date" id="date-hired" value="${today}" required />
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary" style="flex: 2">
                            Add Employee
                        </button>
                        <button type="button" id="cancel-btn" class="btn btn-outline" style="flex: 1">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Handle form submission
    const form = document.getElementById('add-employee-form');
    const errorElement = document.getElementById('add-employee-error');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const employeeData = {
            first_name: document.getElementById('first-name').value,
            last_name: document.getElementById('last-name').value,
            email: document.getElementById('email').value,
            position: document.getElementById('position').value,
            salary: parseFloat(document.getElementById('salary').value) * 100000,
            date_hired: document.getElementById('date-hired').value,
        };

        try {
            errorElement.style.display = 'none';
            await api.addEmployee(employeeData);
            router.navigate('/dashboard');
        } catch (error) {
            document.getElementById('error-message').textContent = error.message;
            errorElement.style.display = 'flex';
        }
    });

    // Handle cancel button
    document.getElementById('cancel-btn').addEventListener('click', () => {
        router.navigate('/dashboard');
    });
}
