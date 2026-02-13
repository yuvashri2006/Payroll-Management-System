import { api } from '../api.js';
import { router } from '../router.js';

export async function renderDashboard() {
    const app = document.getElementById('app');

    // Check authentication
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        router.navigate('/');
        return;
    }

    const user = JSON.parse(userStr);

    // Show loading state
    app.innerHTML = '<div class="loading">Loading...</div>';

    try {
        // Fetch employees
        const employees = await api.getEmployees();

        // Render dashboard
        app.innerHTML = `
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <h1>Welcome, ${user.username}</h1>
                    <div class="header-actions">
                        <button id="add-employee-btn" class="add-btn">Add Employee</button>
                        <button id="logout-btn" class="logout-btn">Logout</button>
                    </div>
                </div>

                <h3>Employee List</h3>
                ${employees.length === 0
                ? '<p>No employees found.</p>'
                : `
                        <table class="employee-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Position</th>
                                    <th>Salary</th>
                                    <th>Hired Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${employees.map(emp => `
                                    <tr>
                                        <td>${emp.id}</td>
                                        <td>${emp.first_name} ${emp.last_name}</td>
                                        <td>${emp.position}</td>
                                        <td>$${emp.salary.toLocaleString()}</td>
                                        <td>${new Date(emp.date_hired).toLocaleDateString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `
            }
            </div>
        `;

        // Add event listeners
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('user');
            router.navigate('/');
        });

        document.getElementById('add-employee-btn').addEventListener('click', () => {
            router.navigate('/add-employee');
        });

    } catch (error) {
        app.innerHTML = `<div class="dashboard-container error">${error.message}</div>`;
    }
}
