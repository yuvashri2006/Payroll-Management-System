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
        <div class="add-employee-container">
            <h2>Add New Employee</h2>
            <p class="error" id="add-employee-error" style="display: none;"></p>
            <form id="add-employee-form" class="add-employee-form">
                <div class="form-group">
                    <label>First Name:</label>
                    <input type="text" id="first-name" required />
                </div>
                <div class="form-group">
                    <label>Last Name:</label>
                    <input type="text" id="last-name" required />
                </div>
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" id="email" required />
                </div>
                <div class="form-group">
                    <label>Position:</label>
                    <input type="text" id="position" required />
                </div>
                <div class="form-group">
                    <label>Salary:</label>
                    <input type="number" id="salary" required />
                </div>
                <div class="form-group">
                    <label>Date Hired:</label>
                    <input type="date" id="date-hired" value="${today}" required />
                </div>
                <button type="submit" class="submit-btn">Add Employee</button>
                <button type="button" id="cancel-btn" class="cancel-btn">Cancel</button>
            </form>
        </div>
    `;

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
            salary: parseFloat(document.getElementById('salary').value),
            date_hired: document.getElementById('date-hired').value,
        };

        try {
            errorElement.style.display = 'none';
            await api.addEmployee(employeeData);
            router.navigate('/dashboard');
        } catch (error) {
            errorElement.textContent = error.message;
            errorElement.style.display = 'block';
        }
    });

    // Handle cancel button
    document.getElementById('cancel-btn').addEventListener('click', () => {
        router.navigate('/dashboard');
    });
}
