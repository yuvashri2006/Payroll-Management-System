import { renderLogin } from './pages/login.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderAddEmployee } from './pages/addEmployee.js';
import { renderEmployeePortal } from './pages/employeePortal.js';
import { renderTrash } from './pages/trash.js';

export const router = {
    routes: {
        '/': renderLogin,
        '/dashboard': renderDashboard,
        '/add-employee': renderAddEmployee,
        '/employee-portal': renderEmployeePortal,
        '/trash': renderTrash,
    },

    navigate(path) {
        const user = JSON.parse(localStorage.getItem('user'));

        // Basic Role Protection
        // Allow /employee-portal to be accessed without login (it has internal verification)
        if (path === '/dashboard' && user?.role !== 'admin') {
            path = user?.role === 'employee' ? '/employee-portal' : '/';
        }
        if (path === '/employee-portal') {
            // Allow access even if not logged in
        } else if (path !== '/' && !user) {
            path = '/';
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
