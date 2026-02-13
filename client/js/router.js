// Client-side router using History API
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;

        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            this.loadRoute(window.location.pathname);
        });
    }

    // Register a route
    addRoute(path, handler) {
        this.routes[path] = handler;
    }

    // Navigate to a route
    navigate(path) {
        window.history.pushState({}, '', path);
        this.loadRoute(path);
    }

    // Load and execute route handler
    async loadRoute(path) {
        this.currentRoute = path;
        const handler = this.routes[path] || this.routes['/'];

        if (handler) {
            await handler();
        }
    }

    // Initialize router
    init() {
        this.loadRoute(window.location.pathname);
    }
}

export const router = new Router();
