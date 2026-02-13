// Main application entry point
import { router } from './router.js';
import { renderLogin } from './pages/login.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderAddEmployee } from './pages/addEmployee.js';

// Register routes
router.addRoute('/', renderLogin);
router.addRoute('/dashboard', renderDashboard);
router.addRoute('/add-employee', renderAddEmployee);

// Initialize the application
router.init();
