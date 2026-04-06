import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function PayslipView({ p }) {
    if (!p) return null;

    const pf = p.pf_deduction || 0;
    const tax = p.tax_deduction || Math.round((p.basic_salary + (p.allowances || 0)) * 0.10);
    const insurance = p.insurance_deduction || 0;
    const leave = p.leave_deduction || 0;

    return (
        <div className="payslip-container printable fade-in">
            <div className="payslip-header">
                <div className="company-branding">
                    <h2 style={{ margin: 0, background: 'linear-gradient(135deg, var(--primary), #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {p.company_name}
                    </h2>
                    <p style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Official Payroll Document</p>
                </div>
                <div className="payslip-title">
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary)', letterSpacing: '0.1em' }}>PAYSLIP</h1>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>#PS-{p.id.toString().padStart(6, '0')}</p>
                </div>
            </div>

            <div className="payslip-meta" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', marginBottom: '3.5rem', background: 'var(--bg-main)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                <div className="meta-item">
                    <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.25rem' }}>Employee</label>
                    <p style={{ fontWeight: 700, color: 'var(--secondary)' }}>{p.first_name} {p.last_name}</p>
                </div>
                <div className="meta-item">
                    <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.25rem' }}>Designation</label>
                    <p style={{ fontWeight: 600 }}>{p.position}</p>
                </div>
                <div className="meta-item">
                    <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.25rem' }}>Period</label>
                    <p style={{ fontWeight: 600 }}>{p.month} {p.year}</p>
                </div>
                <div className="meta-item">
                    <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.25rem' }}>Issued On</label>
                    <p style={{ fontWeight: 600 }}>{new Date(p.issue_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
            </div>

            <div className="payslip-grid">
                <div className="grid-section">
                    <h4 style={{ borderBottom: '2px solid var(--primary-light)', paddingBottom: '0.5rem', marginBottom: '1.5rem', fontSize: '0.8125rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Earnings Spectrum</h4>
                    <div className="payslip-table">
                        <div className="payslip-row">
                            <span>Basic Base Salary</span>
                            <span>₹{(p.basic_salary || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="payslip-row">
                            <span>Performance Allowances</span>
                            <span>₹{(p.allowances || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="payslip-row total" style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
                            <span style={{ color: 'var(--secondary)', fontWeight: 800 }}>GROSS REVENUE</span>
                            <span style={{ color: 'var(--secondary)', fontWeight: 800 }}>₹{((p.basic_salary || 0) + (p.allowances || 0)).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>

                <div className="grid-section">
                    <h4 style={{ borderBottom: '2px solid #fee2e2', paddingBottom: '0.5rem', marginBottom: '1.5rem', fontSize: '0.8125rem', color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Deductions Ledger</h4>
                    <div className="payslip-table">
                        <div className="payslip-row">
                            <span>Statutory PF (12%)</span>
                            <span>₹{(pf || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="payslip-row">
                            <span>Taxation Withheld (10%)</span>
                            <span>₹{(tax || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="payslip-row">
                            <span>Corporate Insurance</span>
                            <span>₹{(insurance || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="payslip-row">
                            <span>Unpaid Absence Penalties</span>
                            <span>₹{(leave || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="payslip-row total" style={{ background: '#fef2f2', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
                            <span style={{ color: 'var(--error)', fontWeight: 800 }}>TOTAL DEDUCTIONS</span>
                            <span style={{ color: 'var(--error)', fontWeight: 800 }}>₹{((pf || 0) + (tax || 0) + (insurance || 0) + (leave || 0)).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="payslip-footer" style={{ marginTop: '4rem' }}>
                <div className="net-pay-highlight">
                    <label>NET LIQUID DISBURSEMENT</label>
                    <div className="amount">₹{(p.net_salary || 0).toLocaleString('en-IN')}</div>
                    <p style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '1rem', fontWeight: 400 }}>Final settlement for the current period</p>
                </div>
                
                <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                        <p><strong>Notes:</strong></p>
                        <p>1. This is a system-generated secure document.</p>
                        <p>2. Values are calculated based on corporate attendance records.</p>
                        <p>3. For discrepancies, contact the Finance Department.</p>
                    </div>
                    <div style={{ textAlign: 'right', opacity: 0.5 }}>
                        <ShieldCheck style={{ width: '32px', height: '32px', color: 'var(--primary)' }} />
                        <p style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.5rem' }}>Verified Digital Output</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
