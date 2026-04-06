import { api } from '../api.js';
import { router } from '../router.js';
import { renderPayslip } from '../components/payslipView.js';

export async function renderDashboard() {
    const app = document.getElementById('app');

    // Enhanced Notification system
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

    // Check authentication
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        router.navigate('/');
        return;
    }

    const user = JSON.parse(userStr);

    // Show loading state
    app.innerHTML = `
        <div class="loading-spinner">
            <i data-lucide="loader-2" class="animate-spin" style="width: 48px; height: 48px;"></i>
        </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    try {
        // Fetch employees
        const employees = await api.getEmployees();

        // Calculate basic stats (Monthly Expenditure = Annual CTC / 12)
        const totalMonthlySalary = employees.reduce((acc, emp) => acc + ((emp.salary || 0) / 12), 0);

        // Header and Stats
        app.innerHTML = `
            <div class="dashboard-container fade-in">
                <div class="dashboard-header" style="margin-bottom: 1.5rem;">
                    <div class="header-info">
                        <h1>Payroll Dashboard</h1>
                        <p>Enterprise Management System</p>
                    </div>
                    <div class="header-actions">
                        <button id="view-trash-btn" class="btn btn-outline" style="color: var(--text-muted);">
                            <i data-lucide="trash-2" style="width: 18px"></i> Trash
                        </button>
                        <button id="add-employee-btn" class="btn btn-primary">
                            <i data-lucide="plus" style="width: 18px"></i> Add New Employee
                        </button>
                        <button id="logout-btn" class="btn btn-outline" style="color: var(--error); border-color: var(--error);">
                            <i data-lucide="log-out" style="width: 18px"></i>
                        </button>
                    </div>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon"><i data-lucide="users"></i></div>
                        <div class="stat-content">
                            <h4>Total Workforce</h4>
                            <div class="value">${employees.length}</div>
                        </div>
                    </div>
                    <div class="stat-card" style="--primary: var(--accent);">
                        <div class="stat-icon" style="color: var(--accent); background: rgba(16, 185, 129, 0.1);"><i data-lucide="banknote"></i></div>
                        <div class="stat-content">
                            <h4>Monthly Expenditure</h4>
                            <div class="value">₹${Math.round(totalMonthlySalary || 0).toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                    <div class="stat-card" style="--primary: var(--warning);">
                        <div class="stat-icon" style="color: var(--warning); background: rgba(245, 158, 11, 0.1);"><i data-lucide="calendar"></i></div>
                        <div class="stat-content">
                            <h4>Active Cycle</h4>
                            <div class="value">${new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date())}</div>
                        </div>
                    </div>
                </div>

                <div class="flex justify-between items-center" style="margin-bottom: 1rem;">
                    <div class="tabs">
                        <button id="tab-employees" class="tab-btn active">Direct Reports</button>
                        <button id="tab-history" class="tab-btn">Transaction Log</button>
                    </div>
                    <div class="search-box">
                        <div class="form-group" style="margin-bottom: 0;">
                            <input type="text" id="universal-search" placeholder="Quick search..." style="width: 320px; background: var(--bg-card);" />
                        </div>
                    </div>
                </div>

                <div id="employees-view" class="tab-content">
                    <div id="employee-table-container" class="card-table"></div>
                </div>

                <div id="history-view" class="tab-content" style="display: none;">
                    <div id="payroll-history-list" class="card-table">
                        <div class="loading-spinner">Loading history...</div>
                    </div>
                </div>
            </div>

            <!-- Enhanced Payroll Modal -->
            <div id="payroll-modal" class="modal-overlay" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <div>
                            <h3 id="modal-emp-name" style="margin-bottom: 0.25rem;"></h3>
                            <p style="font-size: 0.875rem;">Generate official monthly payslip</p>
                        </div>
                        <button id="close-modal" class="close-btn">&times;</button>
                    </div>
                    <form id="process-payroll-form">
                        <input type="hidden" id="modal-emp-id">
                        <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; margin-bottom: 0.5rem;">
                            <div class="form-group">
                                <label>Company Name</label>
                                <input type="text" id="company-name" value="Pon Industries" readonly />
                            </div>
                            <div class="form-group">
                                <label>Annual Package (LPA)</label>
                                <input type="number" id="annual-ctc" step="any" />
                            </div>
                            <div class="form-group">
                                <label>Basic Monthly <span style="font-size:0.75rem;color:var(--text-muted)">(auto)</span></label>
                                <input type="number" id="basic-salary" readonly style="background:var(--bg-card);color:var(--text-muted);cursor:default;" />
                            </div>
                            <div class="form-group">
                                <label>Per Day Salary <span style="font-size:0.75rem;color:var(--text-muted)">(auto)</span></label>
                                <input type="number" id="per-day-salary" readonly style="background:var(--bg-card);color:var(--text-muted);cursor:default;" />
                            </div>
                            <input type="hidden" id="days-worked" value="26" />
                            <div class="form-group">
                                <label>Performance Bonus</label>
                                <input type="number" id="allowances" value="5000" />
                            </div>
                            <div class="form-group">
                                <label>Insurance Premium</label>
                                <input type="number" id="insurance" value="1000" />
                            </div>
                            <div class="form-group">
                                <label>Provident Fund (PF)</label>
                                <input type="number" id="pf-deduction" value="1800" />
                            </div>
                            <div class="form-group">
                                <label>Tax % <span style="font-size:0.75rem;color:var(--text-muted)">(applied on gross)</span></label>
                                <input type="number" id="tax-percent" value="10" min="0" max="100" step="0.5" />
                            </div>
                            <div class="form-group">
                                <label>Tax Amount <span style="font-size:0.75rem;color:var(--text-muted)">(auto)</span></label>
                                <input type="number" id="tax-amount" readonly style="background:var(--bg-card);color:var(--text-muted);cursor:default;" />
                            </div>
                            <div class="form-group">
                                <label>Leave Days Taken <span style="font-size:0.75rem;color:var(--text-muted)">(salary deducted per day)</span></label>
                                <input type="number" id="leave-deduction" value="0" min="0" step="1" />
                            </div>
                            <div class="form-group" style="grid-column: span 2;">
                                <label>Payment Period</label>
                                <div style="display: flex; gap: 0.5rem;">
                                    <select id="pay-month">
                                        ${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => `<option value="${m}">${m}</option>`).join('')}
                                    </select>
                                    <input type="number" id="pay-year" value="${new Date().getFullYear()}" style="width: 100px" />
                                </div>
                            </div>
                        </div>
                        
                        <div class="net-pay-highlight" style="padding: 0.5rem 0.75rem; margin-top: 0;">
                            <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:0.5rem; opacity:0.85;">
                                <span>Gross Salary</span>
                                <span id="live-gross-salary" style="font-weight:600;">₹0</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:0.75rem; color:#f87171;">
                                <span>Total Deductions</span>
                                <span id="live-deductions" style="font-weight:600;">- ₹0</span>
                            </div>
                            <div style="border-top:1px solid rgba(255,255,255,0.15); padding-top:0.5rem;">
                                <label>NET SALARY PAYABLE</label>
                                <div id="live-net-salary" class="amount" style="font-size: 2rem;">₹0</div>
                            </div>
                            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem; font-size: 0.9rem; padding: 0.5rem;">
                                <i data-lucide="check-circle" style="width: 16px"></i> Finalize & Send
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Edit Employee Modal -->
            <div id="edit-modal" class="modal-overlay" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Edit Personnel File</h3>
                        <button id="close-edit-modal" class="close-btn">&times;</button>
                    </div>
                    <form id="edit-employee-form">
                        <input type="hidden" id="edit-emp-id">
                        <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label>First Name</label>
                                <input type="text" id="edit-first-name" required />
                            </div>
                            <div class="form-group">
                                <label>Last Name</label>
                                <input type="text" id="edit-last-name" required />
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Corporate CRM Email</label>
                            <input type="email" id="edit-email" required />
                        </div>
                        <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label>Designation</label>
                                <input type="text" id="edit-position" required />
                            </div>
                            <div class="form-group">
                                <label>Annual CTC</label>
                                <input type="number" id="edit-salary" step="any" required />
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Effective Date</label>
                            <input type="date" id="edit-date-hired" required />
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Update Records</button>
                    </form>
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();

        // Modal Logic
        const modal = document.getElementById('payroll-modal');
        const closeBtn = document.getElementById('close-modal');
        const processForm = document.getElementById('process-payroll-form');

        const editModal = document.getElementById('edit-modal');
        const closeEditBtn = document.getElementById('close-edit-modal');
        const editForm = document.getElementById('edit-employee-form');

        // Tab Switching
        document.getElementById('tab-employees').addEventListener('click', () => {
            document.getElementById('employees-view').style.display = 'block';
            document.getElementById('history-view').style.display = 'none';
            document.getElementById('tab-employees').classList.add('active');
            document.getElementById('tab-history').classList.remove('active');
        });

        document.getElementById('tab-history').addEventListener('click', async () => {
            document.getElementById('employees-view').style.display = 'none';
            document.getElementById('history-view').style.display = 'block';
            document.getElementById('tab-employees').classList.remove('active');
            document.getElementById('tab-history').classList.add('active');
            loadPayrollHistory();
        });

        async function loadPayrollHistory() {
            const historyList = document.getElementById('payroll-history-list');
            try {
                const payrolls = await api.getPayrolls();

                function renderHistoryTable(data) {
                    if (data.length === 0) {
                        historyList.innerHTML = '<div style="padding: 4rem; text-align: center; color: var(--text-muted);"><i data-lucide="inbox" style="width: 48px; height: 48px; opacity: 0.2; margin-bottom: 1rem;"></i><br>No transactions recorded yet.</div>';
                        if (window.lucide) window.lucide.createIcons();
                    } else {
                        historyList.innerHTML = `
                            <table class="employee-table">
                                <thead>
                                    <tr>
                                        <th>Beneficiary</th>
                                        <th>Period</th>
                                        <th style="text-align: right">Total Payout</th>
                                        <th style="text-align: right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.map(p => `
                                        <tr>
                                            <td>
                                                <div class="emp-name" style="font-weight: 700;">${p.first_name} ${p.last_name}</div>
                                            </td>
                                            <td><span style="font-weight: 500;">${p.month && p.year ? `${p.month} ${p.year}` : 'N/A'}</span></td>
                                            <td style="text-align: right; color: var(--accent); font-weight: 700;">₹${(p.net_salary || 0).toLocaleString('en-IN')}</td>
                                            <td style="text-align: right">
                                                <div class="flex gap-2 justify-end">
                                                    <button class="btn btn-outline btn-sm view-slip-btn" data-id="${p.id}">
                                                        <i data-lucide="eye" style="width: 14px"></i>
                                                    </button>
                                                    <button class="btn btn-outline btn-sm delete-payroll-btn" data-id="${p.id}" style="color: var(--error);">
                                                        <i data-lucide="trash-2" style="width: 14px"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        `;
                        if (window.lucide) window.lucide.createIcons();

                        document.querySelectorAll('.delete-payroll-btn').forEach(btn => {
                            btn.addEventListener('click', async () => {
                                if (confirm('Irreversibly delete this transaction?')) {
                                    try {
                                        await api.deletePayroll(btn.dataset.id);
                                        showToast('Transaction deleted', 'success');
                                        loadPayrollHistory();
                                    } catch (error) {
                                        showToast(error.message, 'error');
                                    }
                                }
                            });
                        });

                        document.querySelectorAll('.view-slip-btn').forEach(btn => {
                            btn.addEventListener('click', () => {
                                const p = data.find(item => item.id == btn.dataset.id);
                                if (p) {
                                    app.innerHTML = `
                                        <div class="dashboard-container fade-in">
                                            <div class="dashboard-header no-print">
                                                <div class="header-info">
                                                    <button id="back-to-dashboard" class="btn btn-outline btn-sm" style="margin-bottom: 1.5rem;">
                                                        <i data-lucide="arrow-left" style="width: 16px"></i> Return to Ledger
                                                    </button>
                                                    <h1>Transaction Record</h1>
                                                </div>
                                                <button class="btn btn-primary no-print" onclick="window.print()">
                                                    <i data-lucide="printer" style="width: 18px"></i> Generate Printout
                                                </button>
                                            </div>
                                            ${renderPayslip(p)}
                                        </div>
                                    `;
                                    if (window.lucide) window.lucide.createIcons();
                                    document.getElementById('back-to-dashboard').addEventListener('click', () => renderDashboard());
                                }
                            });
                        });
                    }
                }

                renderHistoryTable(payrolls);

                // Universal search adaptation
                const historySearch = document.getElementById('universal-search');
                historySearch.placeholder = "Search transactions...";
                historySearch.addEventListener('input', (e) => {
                    const term = e.target.value.toLowerCase();
                    const filtered = payrolls.filter(p =>
                        `${p.first_name} ${p.last_name}`.toLowerCase().includes(term)
                    );
                    renderHistoryTable(filtered);
                });

            } catch (error) {
                historyList.innerHTML = `<div class="error-box">${error.message}</div>`;
            }
        }

        const tableContainer = document.getElementById('employee-table-container');

        function renderEmployeeTable(data) {
            if (data.length === 0) {
                tableContainer.innerHTML = '<div style="padding: 4rem; text-align: center; color: var(--text-muted);"><i data-lucide="user-plus" style="width: 48px; height: 48px; opacity: 0.2; margin-bottom: 1rem;"></i><br>No active personnel found.</div>';
                if (window.lucide) window.lucide.createIcons();
                return;
            }

            tableContainer.innerHTML = `
                <table class="employee-table">
                    <thead>
                        <tr>
                            <th>Personnel</th>
                            <th>Designation</th>
                            <th style="text-align: right">Annual CTC</th>
                            <th>Effective Date</th>
                            <th style="text-align: right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(emp => {
                const joinYear = new Date(emp.date_hired).getFullYear().toString().slice(-2);
                const displayId = `EMP${joinYear}${emp.id.toString().padStart(3, '0')}`;
                return `
                            <tr>
                                <td>
                                    <div class="emp-name-cell">
                                        <div class="emp-avatar">${emp.first_name[0]}${emp.last_name[0]}</div>
                                        <div class="emp-info">
                                            <span class="emp-name">${emp.first_name} ${emp.last_name}</span>
                                            <span class="emp-id-sub">${displayId}</span>
                                        </div>
                                    </div>
                                </td>
                                <td><span style="font-weight: 500;">${emp.position}</span></td>
                                <td style="text-align: right; font-weight: 700;">₹${(emp.salary / 100000).toFixed(2)} LPA</td>
                                <td>${new Date(emp.date_hired).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                <td style="text-align: right">
                                    <div class="flex gap-2 justify-end">
                                        <button class="btn btn-primary btn-sm process-btn" data-id="${emp.id}" data-name="${emp.first_name} ${emp.last_name}" data-salary="${emp.salary}">
                                            <i data-lucide="calculator" style="width: 14px"></i> Run Payroll
                                        </button>
                                        <button class="btn btn-outline btn-sm edit-btn" data-id="${emp.id}">
                                            <i data-lucide="edit" style="width: 14px"></i>
                                        </button>
                                        <button class="btn btn-outline btn-sm delete-emp-btn" data-id="${emp.id}" style="color: var(--error);">
                                            <i data-lucide="trash-2" style="width: 14px"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            `;
            }).join('')}
                    </tbody>
                </table>
            `;
            if (window.lucide) window.lucide.createIcons();

            // Live Net Salary Update
            const updateNetSalary = () => {
                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                const monthName = document.getElementById('pay-month').value;
                const year = parseInt(document.getElementById('pay-year').value) || new Date().getFullYear();
                const monthIndex = monthNames.indexOf(monthName);
                const totalDaysInMonth = new Date(year, monthIndex + 1, 0).getDate();

                const basic = parseFloat(document.getElementById('basic-salary').value) || 0;
                const perDay = basic / totalDaysInMonth;  // daily rate based on actual month days
                document.getElementById('per-day-salary').value = perDay.toFixed(2);
                const leaveDaysTaken = parseFloat(document.getElementById('leave-deduction').value) || 0;
                const leaveDeduction = perDay * leaveDaysTaken;
                const allowances = parseFloat(document.getElementById('allowances').value) || 0;
                const insurance = parseFloat(document.getElementById('insurance').value) || 0;
                const pf = parseFloat(document.getElementById('pf-deduction').value) || 0;

                // Auto-zero tax for <= 3 LPA
                const annualLPA = parseFloat(document.getElementById('annual-ctc').value) || 0;
                const taxPercentInput = document.getElementById('tax-percent');
                if (annualLPA <= 3.0 && annualLPA > 0) {
                    taxPercentInput.value = 0;
                    taxPercentInput.setAttribute('disabled', 'true');
                    taxPercentInput.title = 'Tax is 0% for packages of 3 LPA or below';
                } else {
                    taxPercentInput.removeAttribute('disabled');
                    taxPercentInput.removeAttribute('title');
                    // Automatically restore to default 10% if they move above 3 LPA so it doesn't stay stuck at 0
                    if (taxPercentInput.value === '0' || taxPercentInput.value === '') {
                        taxPercentInput.value = 10;
                    }
                }

                const taxPercent = parseFloat(taxPercentInput.value) || 0;
                const tax = Math.round((basic + allowances) * (taxPercent / 100));
                document.getElementById('tax-amount').value = tax;

                const grossSalary = basic + allowances;
                const totalDeductions = leaveDeduction + tax + insurance + pf;
                const net = grossSalary - totalDeductions;

                document.getElementById('live-gross-salary').textContent = `₹${Math.round(grossSalary).toLocaleString('en-IN')}`;
                document.getElementById('live-deductions').textContent = `- ₹${Math.round(totalDeductions).toLocaleString('en-IN')}`;
                document.getElementById('live-net-salary').textContent = `₹${Math.max(0, Math.round(net)).toLocaleString('en-IN')}`;
            };

            // Update per-day display when month or year changes
            const recalcWorkingDays = () => {
                updateNetSalary();
            };

            // Re-add listeners for actions inside the table
            document.querySelectorAll('.process-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.getElementById('modal-emp-name').textContent = btn.dataset.name;
                    document.getElementById('modal-emp-id').value = btn.dataset.id;
                    const annual = parseFloat(btn.dataset.salary) || 0;
                    document.getElementById('annual-ctc').value = (annual / 100000).toFixed(2);
                    const monthlyBase = (annual / 12).toFixed(0);
                    document.getElementById('basic-salary').value = monthlyBase;
                    document.getElementById('per-day-salary').value = (parseFloat(monthlyBase) / 26).toFixed(2);
                    document.getElementById('pay-month').value = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());
                    updateNetSalary();
                    modal.style.display = 'flex';
                });
            });

            // Listen for changes in the modal inputs
            ['allowances', 'insurance', 'leave-deduction', 'pf-deduction', 'tax-percent'].forEach(id => {
                const input = document.getElementById(id);
                if (input) input.addEventListener('input', updateNetSalary);
            });

            // Recalculate working days when month, year, or weekly leave changes
            ['pay-month', 'pay-year', 'weekly-leave-days'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.addEventListener('change', recalcWorkingDays);
                if (el) el.addEventListener('input', recalcWorkingDays);
            });

            // Auto-calculate monthly basic when Annual CTC changes
            const annualCtcInput = document.getElementById('annual-ctc');
            const basicSalaryInput = document.getElementById('basic-salary');
            if (annualCtcInput && basicSalaryInput) {
                annualCtcInput.addEventListener('input', () => {
                    const annualLPA = parseFloat(annualCtcInput.value) || 0;
                    const annualAmount = annualLPA * 100000;
                    basicSalaryInput.value = Math.round(annualAmount / 12);
                    updateNetSalary();
                });
            }

            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const emp = employees.find(e => e.id == btn.dataset.id);
                    if (emp) {
                        document.getElementById('edit-emp-id').value = emp.id;
                        document.getElementById('edit-first-name').value = emp.first_name;
                        document.getElementById('edit-last-name').value = emp.last_name;
                        document.getElementById('edit-email').value = emp.email;
                        document.getElementById('edit-position').value = emp.position;
                        document.getElementById('edit-salary').value = (emp.salary / 100000).toFixed(2);
                        document.getElementById('edit-date-hired').value = emp.date_hired.split('T')[0];
                        editModal.style.display = 'flex';
                    }
                });
            });

            document.querySelectorAll('.delete-emp-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (confirm('Move this employee to trash? They can be restored later or deleted permanently from the Trash section.')) {
                        try {
                            console.log(`[DEBUG] Deleting employee ID: ${btn.dataset.id}`);
                            await api.deleteEmployee(btn.dataset.id);
                            showToast('Employee deleted', 'success');
                            renderDashboard();
                        } catch (error) {
                            showToast(error.message, 'error');
                        }
                    }
                });
            });
        }

        // Initial render
        renderEmployeeTable(employees);

        // Search Logic
        const empSearch = document.getElementById('universal-search');
        empSearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = employees.filter(emp =>
                `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(term) ||
                emp.position.toLowerCase().includes(term)
            );
            renderEmployeeTable(filtered);
        });

        closeBtn.addEventListener('click', () => modal.style.display = 'none');
        closeEditBtn.addEventListener('click', () => editModal.style.display = 'none');

        processForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Recalculate monetary values that depend on formulas
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            const monthName = document.getElementById('pay-month').value;
            const year = parseInt(document.getElementById('pay-year').value) || new Date().getFullYear();
            const monthIndex = monthNames.indexOf(monthName);
            const totalDaysInMonth = new Date(year, monthIndex + 1, 0).getDate();

            const basic = parseFloat(document.getElementById('basic-salary').value) || 0;
            const perDay = basic / totalDaysInMonth;
            const leaveDaysTaken = parseFloat(document.getElementById('leave-deduction').value) || 0;
            const monetaryLeaveDeduction = perDay * leaveDaysTaken;
            const actualTaxAmount = parseFloat(document.getElementById('tax-amount').value) || 0;

            const payrollData = {
                employee_id: parseInt(document.getElementById('modal-emp-id').value),
                company_name: document.getElementById('company-name').value,
                basic_salary: basic,
                allowances: parseFloat(document.getElementById('allowances').value) || 0,
                pf_deduction: parseFloat(document.getElementById('pf-deduction').value) || 0,
                tax_deduction: actualTaxAmount,
                insurance_deduction: parseFloat(document.getElementById('insurance').value) || 0,
                leave_deduction: monetaryLeaveDeduction,
                month: monthName,
                year: year,
                issue_date: new Date().toISOString().split('T')[0],
                status: 'paid'
            };

            // Calculate net salary
            const gross = payrollData.basic_salary + payrollData.allowances;
            const deductions = payrollData.pf_deduction + payrollData.tax_deduction + payrollData.insurance_deduction + payrollData.leave_deduction;
            payrollData.net_salary = gross - deductions;

            try {
                const response = await api.postPayroll(payrollData);
                showToast('Transaction finalized successfully', 'success');
                modal.style.display = 'none';

                // Navigate to payslip view immediately
                const emp = employees.find(e => e.id == payrollData.employee_id);
                const completePayroll = {
                    ...payrollData,
                    id: response.id,
                    first_name: emp.first_name,
                    last_name: emp.last_name,
                    position: emp.position
                };

                app.innerHTML = `
                    <div class="dashboard-container fade-in">
                        <div class="dashboard-header no-print">
                            <div class="header-info">
                                <button id="back-to-dashboard" class="btn btn-outline btn-sm" style="margin-bottom: 1.5rem;">
                                    <i data-lucide="arrow-left" style="width: 16px"></i> Back to Dashboard
                                </button>
                                <h1>Transaction Record</h1>
                            </div>
                            <button class="btn btn-primary no-print" onclick="window.print()">
                                <i data-lucide="printer" style="width: 18px"></i> Generate Printout
                            </button>
                        </div>
                        ${renderPayslip(completePayroll)}
                    </div>
                `;
                if (window.lucide) window.lucide.createIcons();
                document.getElementById('back-to-dashboard').addEventListener('click', () => renderDashboard());

            } catch (error) {
                showToast(error.message, 'error');
            }
        });

        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-emp-id').value;
            const employeeData = {
                first_name: document.getElementById('edit-first-name').value,
                last_name: document.getElementById('edit-last-name').value,
                email: document.getElementById('edit-email').value,
                position: document.getElementById('edit-position').value,
                salary: parseFloat(document.getElementById('edit-salary').value) * 100000,
                date_hired: document.getElementById('edit-date-hired').value
            };

            try {
                await api.updateEmployee(id, employeeData);
                showToast('Personnel file synchronized', 'success');
                editModal.style.display = 'none';
                renderDashboard();
            } catch (error) {
                showToast(error.message, 'error');
            }
        });

        // Add event listeners
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('user');
            router.navigate('/');
        });

        document.getElementById('add-employee-btn').addEventListener('click', () => {
            router.navigate('/add-employee');
        });

        document.getElementById('view-trash-btn')?.addEventListener('click', () => {
            router.navigate('/trash');
        });

    } catch (error) {
        app.innerHTML = `<div class="dashboard-container error-box">${error.message}</div>`;
    }
}
