// API Service - handles all HTTP requests to the backend
const API_BASE_URL = 'http://localhost:3030/api';

export const api = {
    // Login user
    async login(username, password) {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid username or password.');
            }
            throw new Error('Login failed. Please try again later.');
        }

        return await response.json();
    },

    // Get all employees
    async getEmployees() {
        const response = await fetch(`${API_BASE_URL}/employees`);

        if (!response.ok) {
            throw new Error('Failed to fetch employee data. Please ensure the server is running.');
        }

        return await response.json();
    },

    // Add new employee
    async addEmployee(employeeData) {
        const response = await fetch(`${API_BASE_URL}/employees`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(employeeData),
        });

        if (!response.ok) {
            throw new Error('Failed to add employee. Please try again.');
        }

        return await response.json();
    },
};
