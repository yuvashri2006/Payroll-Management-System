// API Service - handles all HTTP requests to the backend
const API_BASE_URL = 'http://localhost:3030/api';

export const api = {
    // Login user
    async login(username, password, role) {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, role }),
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

    // Get all payrolls
    async getPayrolls() {
        const response = await fetch(`${API_BASE_URL}/payrolls`);
        if (!response.ok) throw new Error('Failed to fetch payroll data.');
        return await response.json();
    },

    // Process payroll
    async postPayroll(payrollData) {
        const response = await fetch(`${API_BASE_URL}/payrolls`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payrollData),
        });
        if (!response.ok) throw new Error('Failed to process payroll.');
        return await response.json();
    },

    async updateEmployee(id, employeeData) {
        const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employeeData)
        });
        if (!response.ok) throw new Error('Failed to update employee');
        return await response.json();
    },

    async deleteEmployee(id) {
        const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete employee');
        return await response.json();
    },

    async deletePayroll(id) {
        const response = await fetch(`${API_BASE_URL}/payrolls/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete payroll record');
        return await response.json();
    },

    async getMyPayrolls(userId) {
        const response = await fetch(`${API_BASE_URL}/payrolls/me?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch your payrolls');
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
