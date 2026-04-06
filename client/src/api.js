export const api = {
    async login(username, password, role) {
        const response = await fetch(`/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role }),
        });
        if (!response.ok) {
            if (response.status === 401) throw new Error('Invalid username or password.');
            throw new Error('Login failed. Please try again later.');
        }
        return await response.json();
    },
    async getEmployees() {
        const response = await fetch(`/employees`);
        if (!response.ok) throw new Error('Failed to fetch employee data.');
        return await response.json();
    },
    async getPayrolls() {
        const response = await fetch(`/payrolls`);
        if (!response.ok) throw new Error('Failed to fetch payroll data.');
        return await response.json();
    },
    async postPayroll(payrollData) {
        const response = await fetch(`/payrolls`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payrollData),
        });
        if (!response.ok) throw new Error('Failed to process payroll.');
        return await response.json();
    },
    async updateEmployee(id, employeeData) {
        const response = await fetch(`/employees/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employeeData)
        });
        if (!response.ok) throw new Error('Failed to update employee');
        return await response.json();
    },
    async deleteEmployee(id) {
        const response = await fetch(`/employees/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to move employee to trash');
        return await response.json();
    },
    async getTrashedEmployees() {
        const response = await fetch(`/employees/trash`);
        if (!response.ok) throw new Error('Failed to fetch trashed employees');
        return await response.json();
    },
    async restoreEmployee(id) {
        const response = await fetch(`/employees/${id}/restore`, { method: 'PUT' });
        if (!response.ok) throw new Error('Failed to restore employee');
        return await response.json();
    },
    async permanentDeleteEmployee(id) {
        const response = await fetch(`/employees/${id}/permanent`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to permanently delete employee');
        return await response.json();
    },
    async updatePayrollStatus(id, status, rejection_reason) {
        const response = await fetch(`/payrolls/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, rejection_reason }),
        });
        if (!response.ok) throw new Error('Failed to update payroll status');
        return await response.json();
    },
    async deletePayroll(id) {
        const response = await fetch(`/payrolls/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete payroll record');
        return await response.json();
    },
    async getMyPayrolls(userId) {
        const response = await fetch(`/payrolls/me?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch your payrolls');
        return await response.json();
    },
    async addEmployee(employeeData) {
        const response = await fetch(`/employees`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employeeData),
        });
        if (!response.ok) throw new Error('Failed to add employee.');
        return await response.json();
    },
    async verifyEmployee(fullName, employeeId, month, year) {
        const url = `/payrolls/verify?fullName=${encodeURIComponent(fullName)}&employeeId=${encodeURIComponent(employeeId)}&month=${encodeURIComponent(month)}&year=${encodeURIComponent(year)}`;
        const response = await fetch(url);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Verification failed');
        }
        return await response.json();
    }
};
