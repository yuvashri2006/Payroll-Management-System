export function renderPayslip(p) {
    const pf = p.pf_deduction || 0;
    const tax = Math.round((p.basic_salary + (p.allowances || 0)) * 0.10);

    return `
        <div class="payslip-container printable">
            <div class="payslip-header">
                <div>
                    <h2 style="margin:0">${p.company_name}</h2>
                    <p style="color:var(--text-muted)">Pon Industries</p>
                </div>
                <div style="text-align: right">
                    <h3 style="margin:0">PAYSLIP</h3>
                    <p>#PS-${p.id.toString().padStart(5, '0')}</p>
                </div>
            </div>

            <div class="payslip-meta">
                <div class="meta-item">
                    <label>Employee Name</label>
                    <p>${p.first_name} ${p.last_name}</p>
                </div>
                <div class="meta-item">
                    <label>Designation</label>
                    <p>${p.position}</p>
                </div>
                <div class="meta-item">
                    <label>Month / Year</label>
                    <p>${p.month} ${p.year}</p>
                </div>
                <div class="meta-item">
                    <label>Issue Date</label>
                    <p>${new Date(p.issue_date).toLocaleDateString()}</p>
                </div>
            </div>

            <div class="payslip-grid">
                <div class="grid-section">
                    <h4>Earnings</h4>
                    <div class="line-item">
                        <span>Basic Salary</span>
                        <span>₹${p.basic_salary.toLocaleString('en-IN')}</span>
                    </div>
                    <div class="line-item">
                        <span>Allowances</span>
                        <span>₹${(p.allowances || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div class="line-total">
                        <span>Gross Earnings</span>
                        <span>₹${(p.basic_salary + (p.allowances || 0)).toLocaleString('en-IN')}</span>
                    </div>
                </div>

                <div class="grid-section">
                    <h4>Deductions</h4>
                    <div class="line-item">
                        <span>Provident Fund (12%)</span>
                        <span>₹${pf.toLocaleString('en-IN')}</span>
                    </div>
                    <div class="line-item">
                        <span>Income Tax (10%)</span>
                        <span>₹${tax.toLocaleString('en-IN')}</span>
                    </div>
                    <div class="line-item">
                        <span>Insurance</span>
                        <span>₹${(p.insurance_deduction || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div class="line-item">
                        <span>Leave / Other</span>
                        <span>₹${(p.leave_deduction || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div class="line-total">
                        <span>Total Deductions</span>
                        <span>₹${(pf + tax + (p.insurance_deduction || 0) + (p.leave_deduction || 0)).toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>

            <div class="payslip-footer">
                <div class="net-pay-box">
                    <label>Net Salary Payable</label>
                    <div class="amount">₹${p.net_salary.toLocaleString('en-IN')}</div>
                </div>
                <p style="text-align: center; font-size: 0.75rem; color: var(--text-muted); margin-top: 2rem;">
                    This is a computer generated document and does not require a signature.
                </p>
            </div>
        </div>
        <div class="flex gap-2 justify-end no-print" style="margin-top: 2rem">
            <button onclick="window.print()" class="btn btn-primary">
                <i data-lucide="printer" style="width: 16px"></i> Print Payslip
            </button>
        </div>
    `;
}
