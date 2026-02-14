import { renderLogin } from './pages/login.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderAddEmployee } from './pages/addEmployee.js';
import { renderEmployeePortal } from './pages/employeePortal.js';

export const router = {
    routes: {
        '/': renderLogin,
        '/dashboard': renderDashboard,
        '/add-employee': renderAddEmployee,
        '/employee-portal': renderEmployeePortal,
    },

    navigate(path) {
        const user = JSON.parse(localStorage.getItem('user'));

        // Basic Role Protection
        if (path === '/dashboard' && user?.role !== 'admin') {
            path = user?.role === 'employee' ? '/employee-portal' : '/';
        }
        if (path === '/employee-portal' && user?.role !== 'employee') {
            path = user?.role === 'admin' ? '/dashboard' : '/';
        }

        window.history.pushState({}, '', path);
        this.resolve();
    },

    resolve() {
        const path = window.location.pathname;
        const render = this.routes[path] || this.routes['/'];
        render();
    },

    init() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            this.resolve();
        });
        this.resolve();
    }
};
