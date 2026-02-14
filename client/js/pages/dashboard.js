import { api } from '../api.js';
import { router } from '../router.js';
import { renderPayslip } from '../components/payslipView.js';

export async function renderDashboard() {
    const app = document.getElementById('app');

    // Notification system
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
            <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}" style="width: 20px"></i>
            <span>${message}</span>
        `;
        container.appendChild(toast);
        if (window.lucide) window.lucide.createIcons();

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    // Check authentication
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        router.navigate('/');
        return;
    }

    const user = JSON.parse(userStr);

    // Show loading state
    app.innerHTML = '<div class="loading">Loading...</div>';

    try {
        // Fetch employees
        const employees = await api.getEmployees();

        // Calculate basic stats
        const totalSalary = employees.reduce((acc, emp) => acc + emp.salary, 0);
        const avgSalary = employees.length > 0 ? (totalSalary / employees.length).toFixed(0) : 0;

        // Render dashboard
        app.innerHTML = `
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <div class="header-info">
                        <h1>Payroll Dashboard</h1>
                        <p>Welcome back, <strong>${user.username}</strong></p>
                    </div>
                    <div class="header-actions">
                        <button id="logout-btn" class="btn btn-outline">
                            <i data-lucide="log-out" style="width: 16px"></i> Sign Out
                        </button>
                        <button id="add-employee-btn" class="btn btn-primary">
                            <i data-lucide="plus" style="width: 16px"></i> Add Employee
                        </button>
                    </div>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon"><i data-lucide="users"></i></div>
                        <div class="stat-content">
                            <h4>Total Employees</h4>
                            <div class="value">${employees.length}</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="color: var(--warning); background: rgba(245, 158, 11, 0.1);"><i data-lucide="history"></i></div>
                        <div class="stat-content">
                            <h4>Payroll Cycle</h4>
                            <div class="value">Active</div>
                        </div>
                    </div>
                </div>

                <div class="tabs" style="margin-bottom: 2rem;">
                    <button id="tab-employees" class="tab-btn active">Employees</button>
                    <button id="tab-history" class="tab-btn">Payroll History</button>
                </div>

                <div id="employees-view" class="tab-content">
                    <div class="flex justify-between items-center" style="margin-bottom: 1rem">
                        <h3>Employee Directory</h3>
                        <div class="search-box">
                            <input type="text" id="emp-search" placeholder="Search by name or position..." class="form-control" style="width: 300px; padding: 0.6rem 1rem; border-radius: 10px; border: 1px solid var(--border);" />
                        </div>
                    </div>

                    <div id="employee-table-container" class="card-table">
                </div>
            </div>

                <div id="history-view" class="tab-content" style="display: none;">
                    <div class="flex justify-between items-center" style="margin-bottom: 1rem">
                        <h3>Processed Payrolls</h3>
                        <div class="search-box">
                            <input type="text" id="history-search" placeholder="Search by employee name..." class="form-control" style="width: 300px; padding: 0.6rem 1rem; border-radius: 10px; border: 1px solid var(--border);" />
                        </div>
                    </div>
                    <div id="payroll-history-list" class="card-table">
                        <div class="loading">Loading history...</div>
                    </div>
                </div>
            </div>

            <!-- Payroll Modal -->
            <div id="payroll-modal" class="modal-overlay" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Payroll: <span id="modal-emp-name"></span></h3>
                        <button id="close-modal" class="close-btn">&times;</button>
                    </div>
                    <form id="process-payroll-form">
                        <input type="hidden" id="modal-emp-id">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Company Name</label>
                                <input type="text" id="company-name" value="Pon Industries" required />
                            </div>
                            <div class="form-group">
                                <label>Basic Salary</label>
                                <input type="number" id="basic-salary" readonly />
                            </div>
                        </div>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Allowances</label>
                                <input type="number" id="allowances" value="5000" />
                            </div>
                            <div class="form-group">
                                <label>Insurance</label>
                                <input type="number" id="insurance" value="1000" />
                            </div>
                        </div>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Leave Deductions</label>
                                <input type="number" id="leave-deduction" value="0" />
                            </div>
                            <div class="form-group">
                                <label>PF Deduction</label>
                                <input type="number" id="pf-deduction" value="1800" />
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Month/Year</label>
                            <div class="flex gap-2">
                                    <select id="pay-month" style="flex: 2; padding: 0.5rem; border-radius: 8px;">
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
                                    <input type="number" id="pay-year" value="2024" style="flex: 1; padding: 0.5rem; border-radius: 8px;" />
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Net Salary Payable</label>
                                <div class="flex items-center gap-4">
                                    <div id="live-net-salary" class="live-result">₹0</div>
                                    <button type="submit" class="btn btn-primary" style="flex: 1">Confirm & Generate Payslip</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Edit Employee Modal -->
            <div id="edit-modal" class="modal-overlay" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Edit Employee</h3>
                        <button id="close-edit-modal" class="close-btn">&times;</button>
                    </div>
                    <form id="edit-employee-form">
                        <input type="hidden" id="edit-emp-id">
                        <div class="form-grid">
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
                            <label>Email Address</label>
                            <input type="email" id="edit-email" required />
                        </div>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Position</label>
                                <input type="text" id="edit-position" required />
                            </div>
                            <div class="form-group">
                                <label>Salary (Annual)</label>
                                <input type="number" id="edit-salary" required />
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Hire Date</label>
                            <input type="date" id="edit-date-hired" required />
                        </div>
                        <div class="form-actions mt-4">
                            <button type="submit" class="btn btn-primary" style="flex: 1">Save Changes</button>
                        </div>
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
                        historyList.innerHTML = '<div style="padding: 3rem; text-align: center; color: var(--text-muted);">No payroll records found.</div>';
                    } else {
                        historyList.innerHTML = `
                            <table class="employee-table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Month/Year</th>
                                        <th style="text-align: right">Net Salary</th>
                                        <th style="text-align: right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.map(p => `
                                        <tr>
                                            <td><strong>${p.first_name} ${p.last_name}</strong></td>
                                            <td>${p.month} ${p.year}</td>
                                            <td style="text-align: right" class="emp-salary">₹${p.net_salary.toLocaleString('en-IN')}</td>
                                            <td style="text-align: right">
                                                <div class="flex gap-2 justify-end">
                                                    <button class="btn btn-outline btn-sm view-slip-btn" data-id="${p.id}">
                                                        <i data-lucide="eye" style="width: 14px"></i>
                                                    </button>
                                                    <button class="btn btn-error btn-sm delete-payroll-btn" data-id="${p.id}">
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
                                if (confirm('Are you sure you want to delete this payroll record?')) {
                                    try {
                                        await api.deletePayroll(btn.dataset.id);
                                        loadPayrollHistory();
                                    } catch (error) {
                                        alert('Error deleting payroll: ' + error.message);
                                    }
                                }
                            });
                        });

                        document.querySelectorAll('.view-slip-btn').forEach(btn => {
                            btn.addEventListener('click', () => {
                                const p = data.find(item => item.id == btn.dataset.id);
                                if (p) {
                                    app.innerHTML = `
                                        <div class="dashboard-container">
                                            <div class="dashboard-header no-print">
                                                <div class="header-info">
                                                    <button id="back-to-dashboard" class="btn btn-outline btn-sm" style="margin-bottom: 1rem;">
                                                        <i data-lucide="arrow-left" style="width: 16px"></i> Back to History
                                                    </button>
                                                    <h1>Payslip Viewer</h1>
                                                </div>
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

                // Search Logic for History
                const historySearch = document.getElementById('history-search');
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
                tableContainer.innerHTML = '<div style="padding: 3rem; text-align: center; color: var(--text-muted);">No employees found matching your search.</div>';
                return;
            }

            tableContainer.innerHTML = `
                <table class="employee-table">
                    <thead>
                        <tr>
                            <th>Employee ID</th>
                            <th>Employee Name</th>
                            <th>Position</th>
                            <th style="text-align: right">Salary</th>
                            <th>Hired Date</th>
                            <th style="text-align: right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(emp => {
                const joinYear = new Date(emp.date_hired).getFullYear().toString().slice(-2);
                const displayId = `${joinYear}${emp.id.toString().padStart(3, '0')}`;
                return `
                            <tr>
                                <td><div class="emp-id">${displayId}</div></td>
                                <td>
                                    <div class="emp-name">${emp.first_name} ${emp.last_name}</div>
                                </td>
                                <td>${emp.position}</td>
                                <td style="text-align: right" class="emp-salary">₹${emp.salary.toLocaleString('en-IN')}</td>
                                <td>${new Date(emp.date_hired).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                <td style="text-align: right">
                                    <div class="flex gap-2 justify-end">
                                        <button class="btn btn-outline btn-sm process-btn" data-id="${emp.id}" data-name="${emp.first_name} ${emp.last_name}" data-salary="${emp.salary}">
                                            <i data-lucide="calculator" style="width: 14px"></i> Payroll
                                        </button>
                                        <button class="btn btn-outline btn-sm edit-btn" data-id="${emp.id}">
                                            <i data-lucide="edit-2" style="width: 14px"></i>
                                        </button>
                                        <button class="btn btn-error btn-sm delete-emp-btn" data-id="${emp.id}">
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
                const basic = parseFloat(document.getElementById('basic-salary').value) || 0;
                const allowances = parseFloat(document.getElementById('allowances').value) || 0;
                const insurance = parseFloat(document.getElementById('insurance').value) || 0;
                const leave = parseFloat(document.getElementById('leave-deduction').value) || 0;
                const pf = parseFloat(document.getElementById('pf-deduction').value) || 0;
                const tax = Math.round((basic + allowances) * 0.10);

                const net = (basic + allowances) - (tax + insurance + leave + pf);
                document.getElementById('live-net-salary').textContent = `₹${net.toLocaleString('en-IN')}`;
            };

            // Re-add listeners for actions inside the table
            document.querySelectorAll('.process-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.getElementById('modal-emp-name').textContent = btn.dataset.name;
                    document.getElementById('modal-emp-id').value = btn.dataset.id;
                    document.getElementById('basic-salary').value = btn.dataset.salary;
                    document.getElementById('pay-month').value = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());
                    updateNetSalary();
                    modal.style.display = 'flex';
                });
            });

            // Listen for changes in the modal inputs
            ['allowances', 'insurance', 'leave-deduction', 'pf-deduction'].forEach(id => {
                const input = document.getElementById(id);
                if (input) input.addEventListener('input', updateNetSalary);
            });

            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const emp = employees.find(e => e.id == btn.dataset.id);
                    if (emp) {
                        document.getElementById('edit-emp-id').value = emp.id;
                        document.getElementById('edit-first-name').value = emp.first_name;
                        document.getElementById('edit-last-name').value = emp.last_name;
                        document.getElementById('edit-email').value = emp.email;
                        document.getElementById('edit-position').value = emp.position;
                        document.getElementById('edit-salary').value = emp.salary;
                        document.getElementById('edit-date-hired').value = emp.date_hired.split('T')[0];
                        editModal.style.display = 'flex';
                    }
                });
            });

            document.querySelectorAll('.delete-emp-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (confirm('Are you sure you want to delete this employee? All related payroll records will also be removed.')) {
                        try {
                            await api.deleteEmployee(btn.dataset.id);
                            renderDashboard(); // Refresh
                        } catch (error) {
                            alert('Error deleting employee: ' + error.message);
                        }
                    }
                });
            });
        }

        // Initial render
        renderEmployeeTable(employees);

        // Search Logic
        const empSearch = document.getElementById('emp-search');
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
            const payrollData = {
                employee_id: parseInt(document.getElementById('modal-emp-id').value),
                company_name: document.getElementById('company-name').value,
                basic_salary: parseFloat(document.getElementById('basic-salary').value),
                allowances: parseFloat(document.getElementById('allowances').value) || 0,
                pf_deduction: parseFloat(document.getElementById('pf-deduction').value) || 0,
                tax_deduction: Math.round((parseFloat(document.getElementById('basic-salary').value) + (parseFloat(document.getElementById('allowances').value) || 0)) * 0.10),
                insurance_deduction: parseFloat(document.getElementById('insurance').value) || 0,
                leave_deduction: parseFloat(document.getElementById('leave-deduction').value) || 0,
                month: document.getElementById('pay-month').value,
                year: parseInt(document.getElementById('pay-year').value),
                issue_date: new Date().toISOString().split('T')[0],
                status: 'paid'
            };

            // Calculate net salary
            const gross = payrollData.basic_salary + payrollData.allowances;
            const deductions = payrollData.pf_deduction + payrollData.tax_deduction + payrollData.insurance_deduction + payrollData.leave_deduction;
            payrollData.net_salary = gross - deductions;

            try {
                const response = await api.postPayroll(payrollData);
                showToast('Payroll processed successfully!');
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
                    <div class="dashboard-container">
                        <div class="dashboard-header no-print">
                            <div class="header-info">
                                <button id="back-to-dashboard" class="btn btn-outline btn-sm" style="margin-bottom: 1rem;">
                                    <i data-lucide="arrow-left" style="width: 16px"></i> Back to Dashboard
                                </button>
                                <h1>Payslip Viewer</h1>
                            </div>
                        </div>
                        ${renderPayslip(completePayroll)}
                    </div>
                `;
                if (window.lucide) window.lucide.createIcons();
                document.getElementById('back-to-dashboard').addEventListener('click', () => renderDashboard());

            } catch (error) {
                showToast('Error: ' + error.message, 'error');
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
                salary: parseFloat(document.getElementById('edit-salary').value),
                date_hired: document.getElementById('edit-date-hired').value
            };

            try {
                await api.updateEmployee(id, employeeData);
                showToast('Employee updated successfully!');
                editModal.style.display = 'none';
                renderDashboard();
            } catch (error) {
                showToast('Error updating employee: ' + error.message, 'error');
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

    } catch (error) {
        app.innerHTML = `<div class="dashboard-container error">${error.message}</div>`;
    }
}
