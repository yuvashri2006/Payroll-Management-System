import { api } from '../api.js';
import { router } from '../router.js';

export async function renderTrash() {
    const app = document.getElementById('app');

    // Check authentication
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        router.navigate('/');
        return;
    }

    // Show loading state
    app.innerHTML = `
        <div class="loading-spinner">
            <i data-lucide="loader-2" class="animate-spin" style="width: 48px; height: 48px;"></i>
        </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    const showToast = (message, type = 'success') => {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="stat-icon" style="width: 32px; height: 32px; background: none; color: inherit;">
                <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}" style="width: 20px"></i>
            </div>
            <span style="font-weight: 500;">${message}</span>
        `;
        container.appendChild(toast);
        if (window.lucide) window.lucide.createIcons();

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    };

    try {
        const trashedEmployees = await api.getTrashedEmployees();

        app.innerHTML = `
            <div class="dashboard-container fade-in">
                <div class="dashboard-header" style="margin-bottom: 1.5rem;">
                    <div class="header-info">
                        <button id="back-to-dashboard" class="btn btn-outline btn-sm" style="margin-bottom: 1.5rem;">
                            <i data-lucide="arrow-left" style="width: 16px"></i> Back to Dashboard
                        </button>
                        <h1>Trash</h1>
                        <p>Deleted personnel records</p>
                    </div>
                </div>

                <div class="card-table">
                    ${trashedEmployees.length === 0 ? `
                        <div style="text-align: center; padding: 4rem 2rem; color: var(--text-muted);">
                            <i data-lucide="trash-2" style="width: 48px; height: 48px; margin-bottom: 1rem; opacity: 0.5;"></i>
                            <h3 style="margin-bottom: 0.5rem;">Trash is empty</h3>
                            <p>No deleted records found.</p>
                        </div>
                    ` : `
                        <table>
                            <thead>
                                <tr>
                                    <th>Personnel</th>
                                    <th>Designation</th>
                                    <th>Action History</th>
                                    <th style="text-align: right">Recovery Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${trashedEmployees.map(emp => {
            const joinYear = new Date(emp.date_hired).getFullYear().toString().slice(-2);
            const displayId = `EMP${joinYear}${emp.id.toString().padStart(3, '0')}`;
            return `
                                        <tr>
                                            <td>
                                                <div class="emp-name-cell">
                                                    <div class="emp-avatar" style="background: var(--bg); color: var(--text-muted);">
                                                        ${emp.first_name[0]}${emp.last_name[0]}
                                                    </div>
                                                    <div class="emp-info">
                                                        <span class="emp-name" style="text-decoration: line-through; opacity: 0.7;">${emp.first_name} ${emp.last_name}</span>
                                                        <span class="emp-id-sub">${displayId}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span style="opacity: 0.7;">${emp.position}</span></td>
                                            <td><span class="badge" style="background: rgba(239, 68, 68, 0.1); color: var(--error);">Soft Deleted</span></td>
                                            <td style="text-align: right">
                                                <div class="flex gap-2 justify-end">
                                                    <button class="btn btn-primary btn-sm restore-btn" data-id="${emp.id}">
                                                        <i data-lucide="rotate-ccw" style="width: 14px"></i> Restore
                                                    </button>
                                                    <button class="btn btn-outline btn-sm perm-delete-btn" data-id="${emp.id}" style="color: var(--error); border-color: var(--error);">
                                                        <i data-lucide="trash-2" style="width: 14px"></i> Delete Forever
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
        }).join('')}
                            </tbody>
                        </table>
                    `}
                </div >
            </div >
            `;

        if (window.lucide) window.lucide.createIcons();

        document.getElementById('back-to-dashboard')?.addEventListener('click', () => {
            router.navigate('/dashboard');
        });

        document.querySelectorAll('.restore-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                try {
                    await api.restoreEmployee(btn.dataset.id);
                    showToast('Employee restored successfully!');
                    renderTrash(); // Refresh view
                } catch (error) {
                    showToast(error.message, 'error');
                }
            });
        });

        document.querySelectorAll('.perm-delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('WARNING: This will permanently delete this employee and all their associated payroll records. This cannot be undone. Are you absolutely sure?')) {
                    try {
                        await api.permanentDeleteEmployee(btn.dataset.id);
                        showToast('Employee permanently deleted', 'success');
                        renderTrash(); // Refresh view
                    } catch (error) {
                        showToast(error.message, 'error');
                    }
                }
            });
        });

    } catch (error) {
        showToast(error.message, 'error');
    }
}
