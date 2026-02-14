import { api } from '../api.js';
import { router } from '../router.js';
import { renderPayslip } from '../components/payslipView.js';

export async function renderEmployeePortal() {
    const app = document.getElementById('app');

    // Check authentication
    const userStr = localStorage.getItem('user');
    if (!userStr || JSON.parse(userStr).role !== 'employee') {
        router.navigate('/');
        return;
    }

    const user = JSON.parse(userStr);

    app.innerHTML = `
        <div class="dashboard-container">
            <div class="dashboard-header">
                <div class="header-info">
                    <h1>Employee Portal</h1>
                    <p>Welcome, <strong>${user.username}</strong>. View and download your payslips below.</p>
                </div>
                <div class="header-actions">
                    <button id="logout-btn" class="btn btn-outline">
                        <i data-lucide="log-out" style="width: 16px"></i> Sign Out
                    </button>
                </div>
            </div>

            <div class="flex justify-between items-center" style="margin-bottom: 1.5rem">
                <h3>My Payslip History</h3>
                <div class="search-box">
                    <input type="text" id="slip-search" placeholder="Search month, year or company..." class="form-control" style="width: 300px; padding: 0.6rem 1rem; border-radius: 10px; border: 1px solid var(--border);" />
                </div>
            </div>

            <div id="payroll-list" class="card-table">
                <div class="loading-spinner">Loading payslips...</div>
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Fetch payrolls for this employee
    try {
        // Using the secure endpoint that only returns payrolls for the logged in user
        const myPayrolls = await api.getMyPayrolls(user.id);

        const listContainer = document.getElementById('payroll-list');

        function renderTable(data) {
            if (data.length === 0) {
                listContainer.innerHTML = '<div style="padding: 3rem; text-align: center; color: var(--text-muted);">No payslips found.</div>';
                return;
            }

            listContainer.innerHTML = `
                <table class="employee-table">
                    <thead>
                        <tr>
                            <th>Month/Year</th>
                            <th>Company</th>
                            <th style="text-align: right">Basic</th>
                            <th style="text-align: right">Net Salary</th>
                            <th style="text-align: center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(p => `
                            <tr>
                                <td><strong>${p.month} ${p.year}</strong></td>
                                <td>${p.company_name || 'N/A'}</td>
                                <td style="text-align: right">₹${p.basic_salary?.toLocaleString('en-IN') || '0'}</td>
                                <td style="text-align: right" class="emp-salary">₹${p.net_salary?.toLocaleString('en-IN') || '0'}</td>
                                <td style="text-align: center">
                                    <button class="btn btn-outline btn-sm view-slip" data-id="${p.id}">
                                        <i data-lucide="eye" style="width: 14px"></i> View
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            if (window.lucide) window.lucide.createIcons();

            // Re-add listeners
            document.querySelectorAll('.view-slip').forEach(btn => {
                btn.addEventListener('click', () => {
                    const payrollId = parseInt(btn.dataset.id);
                    const payroll = myPayrolls.find(p => p.id === payrollId);
                    if (payroll) {
                        app.innerHTML = `
                            <div class="dashboard-container">
                                <div class="dashboard-header no-print">
                                    <button id="back-to-portal" class="btn btn-outline btn-sm">
                                        <i data-lucide="arrow-left" style="width: 16px"></i> Back to History
                                    </button>
                                    <h1>Payslip Viewer</h1>
                                </div>
                                ${renderPayslip(payroll)}
                            </div>
                        `;
                        if (window.lucide) window.lucide.createIcons();
                        document.getElementById('back-to-portal').addEventListener('click', () => renderEmployeePortal());
                    }
                });
            });
        }

        renderTable(myPayrolls);

        // Search Logic
        const searchInput = document.getElementById('slip-search');
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = myPayrolls.filter(p =>
                p.month.toLowerCase().includes(term) ||
                p.year.toString().includes(term) ||
                (p.company_name && p.company_name.toLowerCase().includes(term))
            );
            renderTable(filtered);
        });

    } catch (error) {
        document.getElementById('payroll-list').innerHTML = `<div class="error-box">${error.message}</div>`;
    }

    // Event Listeners
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('user');
        router.navigate('/');
    });
}
