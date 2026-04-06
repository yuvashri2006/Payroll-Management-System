import { api } from '../api.js';
import { router } from '../router.js';
import { renderPayslip } from '../components/payslipView.js';

export async function renderEmployeePortal() {
    const app = document.getElementById('app');

    // Check authentication - allow guest access but with restricted UI
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : { username: 'Guest', role: 'guest' };

    const welcomeMsg = user.role === 'employee'
        ? `Welcome, <strong>${user.username}</strong>. Verify your details to access your payslips.`
        : `Please verify your identity to access your payroll documents.`;

    app.innerHTML = `
        <div class="dashboard-container">
            <div class="dashboard-header">
                <div class="header-info">
                    <h1>Employee Portal</h1>
                    <p>${welcomeMsg}</p>
                </div>
                <div class="header-actions">
                    <button id="logout-btn" class="btn btn-outline">
                        <i data-lucide="log-out" style="width: 16px"></i> Sign Out
                    </button>
                </div>
            </div>

            <div id="verification-section" class="card" style="max-width: 500px; margin: 2rem auto; padding: 2rem;">
                <h3 style="margin-bottom: 1.5rem; text-align: center;">Payslip Access</h3>
                <form id="verify-form">
                    <div class="form-group">
                        <label>Your Full Name</label>
                        <input type="text" id="verify-name" value="${user.username}" placeholder="Full Name" required />
                    </div>
                    <div class="form-group">
                        <label>Employee ID (YYNNN)</label>
                        <input type="text" id="verify-id" placeholder="e.g. 26001" required />
                    </div>
                    <div class="flex gap-2" style="margin-top: 1rem;">
                        <div class="form-group flex-1">
                            <label>Month</label>
                            <select id="verify-month" class="form-control" style="width: 100%; border: 1px solid var(--border); border-radius: var(--radius); padding: 0.75rem;" required>
                                <option value="">Month</option>
                                <option value="January">January</option>
                                <option value="February">February</option>
                                <option value="March">March</option>
                                <option value="April">April</option>
                                <option value="May">May</option>
                                <option value="June">June</option>
                                <option value="July">July</option>
                                <option value="August">August</option>
                                <option value="September">September</option>
                                <option value="October">October</option>
                                <option value="November">November</option>
                                <option value="December">December</option>
                            </select>
                        </div>
                        <div class="form-group flex-1">
                            <label>Year</label>
                            <input type="number" id="verify-year" value="${new Date().getFullYear()}" style="width: 100%; border: 1px solid var(--border); border-radius: var(--radius); padding: 0.75rem;" required />
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1.5rem;">
                        <i data-lucide="shield-check" style="width: 18px"></i> Verify & View Payslips
                    </button>
                    <div id="verify-error" class="error-box" style="display: none; margin-top: 1rem;"></div>
                </form>
            </div>

            <div id="portal-content" style="display: none;">
                <div class="flex justify-between items-center" style="margin-bottom: 1.5rem">
                    <h3>My Payslip History</h3>
                </div>

                <div id="payroll-list" class="card-table">
                    <div class="loading-spinner">Loading payslips...</div>
                </div>
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const verifyForm = document.getElementById('verify-form');
    const verifySection = document.getElementById('verification-section');
    const portalContent = document.getElementById('portal-content');
    const verifyError = document.getElementById('verify-error');

    verifyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('verify-name').value;
        const employeeId = document.getElementById('verify-id').value;
        const month = document.getElementById('verify-month').value;
        const yearInput = document.getElementById('verify-year').value;
        const year = parseInt(yearInput);

        // Validation: Access year must be >= hiring year (from ID prefix)
        const hiringYearShort = parseInt(employeeId.substring(0, 2));
        const hiringYear = 2000 + hiringYearShort;

        if (year < hiringYear) {
            verifyError.textContent = `You cannot access payslips prior to your hiring year (${hiringYear}).`;
            verifyError.style.display = 'flex';
            return;
        }

        try {
            verifyError.style.display = 'none';
            const myPayrolls = await api.verifyEmployee(fullName, employeeId, month, year);

            verifySection.style.display = 'none';
            portalContent.style.display = 'block';
            renderPortalContent(myPayrolls);

        } catch (error) {
            verifyError.textContent = error.message;
            verifyError.style.display = 'flex';
        }
    });

    function renderPortalContent(myPayrolls) {
        const listContainer = document.getElementById('payroll-list');

        function renderTable(data) {
            if (data.length === 0) {
                listContainer.innerHTML = '<div style="padding: 3rem; text-align: center; color: var(--text-muted);">No payslips found for this ID.</div>';
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

    }

    // Event Listeners
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('user');
        router.navigate('/');
    });
}
