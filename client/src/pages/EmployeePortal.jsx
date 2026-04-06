import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import PayslipView from '../components/PayslipView';
import {
    LogOut, ArrowLeft, Eye, Printer, CheckCircle,
    FileText, ShieldCheck, Inbox, AlertCircle, XCircle, MessageSquare, Menu
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

export default function EmployeePortal() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Verification form state
    const [verifyName, setVerifyName] = useState('');
    const [verifyId, setVerifyId] = useState('');
    const [verifyMonth, setVerifyMonth] = useState('');
    const [verifyYear, setVerifyYear] = useState(new Date().getFullYear());
    const [verifyError, setVerifyError] = useState('');
    const [verifying, setVerifying] = useState(false);

    // Portal content state
    const [payrolls, setPayrolls] = useState(null);
    const [viewingPayslip, setViewingPayslip] = useState(null);
    const [confirmed, setConfirmed] = useState({});
    const [rejected, setRejected] = useState({});   // { [id]: reason string }
    const [rejectModal, setRejectModal] = useState(null); // payroll object being rejected
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        const u = JSON.parse(userStr);
        setUser(u);
        // Pre-fill name from login
        setVerifyName(u.username || '');
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setVerifyError('');
        setVerifying(true);

        const hiringYearShort = parseInt(verifyId.substring(0, 2));
        const hiringYear = 2000 + hiringYearShort;
        if (Number(verifyYear) < hiringYear) {
            setVerifyError(`You cannot access payslips prior to your hiring year (${hiringYear}).`);
            setVerifying(false);
            return;
        }

        try {
            const results = await api.verifyEmployee(verifyName, verifyId, verifyMonth, verifyYear);
            setPayrolls(results);

            const initConfirmed = {};
            const initRejected = {};
            results.forEach(p => {
                if (p.status === 'confirmed') initConfirmed[p.id] = true;
                if (p.status === 'rejected')  initRejected[p.id] = p.rejection_reason || 'No reason provided';
            });
            setConfirmed(initConfirmed);
            setRejected(initRejected);
        } catch (err) {
            setVerifyError(err.message || 'Verification failed. Please check your details.');
        } finally {
            setVerifying(false);
        }
    };

    const handleConfirm = async (id) => {
        try {
            await api.updatePayrollStatus(id, 'confirmed');
        } catch (e) { /* silent */ }
        setConfirmed(prev => ({ ...prev, [id]: true }));
        setRejected(prev => { const n = { ...prev }; delete n[id]; return n; });
    };

    const openRejectModal = (payroll) => {
        setRejectReason('');
        setRejectModal(payroll);
    };

    const handleRejectSubmit = async (e) => {
        e.preventDefault();
        const reason = rejectReason.trim() || 'No reason provided';
        try {
            await api.updatePayrollStatus(rejectModal.id, 'rejected', reason);
        } catch (e) { /* silent */ }
        setRejected(prev => ({ ...prev, [rejectModal.id]: reason }));
        setConfirmed(prev => { const n = { ...prev }; delete n[rejectModal.id]; return n; });
        setRejectModal(null);
        setRejectReason('');
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // ─── Payslip Viewer ───────────────────────────────────────────────────────
    if (viewingPayslip) {
        const isConfirmed = confirmed[viewingPayslip.id];
        const isRejected = rejected[viewingPayslip.id];
        return (
            <div className="layout-container">
                <div className="main-content">
                    <div className="dashboard-container fade-in">
                        <div className="page-header no-print">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div>
                                    <button onClick={() => setViewingPayslip(null)} className="btn btn-outline btn-sm" style={{ marginBottom: '0.5rem' }}>
                                        <ArrowLeft style={{ width: '16px' }} /> Back to History
                                    </button>
                                    <h1 style={{ margin: 0 }}>Transaction Record</h1>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                {isConfirmed && <span style={{ color: 'var(--accent)', fontWeight: 700 }}><CheckCircle size={16} /></span>}
                                {isRejected && <span style={{ color: 'var(--error)', fontWeight: 700 }}><XCircle size={16} /></span>}
                                <button className="btn btn-outline" onClick={() => window.print()}>
                                    <Printer size={18} /> Print
                                </button>
                            </div>
                        </div>
                        <PayslipView p={viewingPayslip} />
                    </div>
                </div>
            </div>
        );
    }

    // ─── Payroll History List ─────────────────────────────────────────────────
    if (payrolls !== null) {
        return (
            <div className="layout-container">
                <div className="main-content">
                    <div className="dashboard-container fade-in">
                        <div className="page-header">
                            <div>
                                <button onClick={() => setPayrolls(null)} className="btn btn-outline btn-sm" style={{ marginBottom: '1rem' }}>
                                    <ArrowLeft style={{ width: '16px' }} /> Back
                                </button>
                                <h1 style={{ margin: 0 }}>My Payslip History</h1>
                                <p style={{ marginTop: '0.25rem' }}>Welcome, <strong>{user?.username}</strong></p>
                            </div>
                            <button onClick={handleLogout} className="btn btn-outline">
                                <LogOut style={{ width: '16px' }} /> Sign Out
                            </button>
                        </div>

                        <div className="card-table">
                            {payrolls.length === 0 ? (
                                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <Inbox style={{ width: '48px', height: '48px', opacity: 0.2, margin: '0 auto 1rem', display: 'block' }} />
                                    <div>No payslips found matching your details.</div>
                                </div>
                            ) : (
                                <table className="employee-table">
                                    <thead>
                                        <tr>
                                            <th>Period</th>
                                            <th style={{ textAlign: 'right' }}>Basic Salary</th>
                                            <th style={{ textAlign: 'right' }}>Net Salary</th>
                                            <th style={{ textAlign: 'center' }}>Status</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payrolls.map(p => (
                                            <tr key={p.id}>
                                                <td>
                                                    <div style={{ fontWeight: 700 }}>{p.month} {p.year}</div>
                                                </td>
                                                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                                    ₹{(p.basic_salary || 0).toLocaleString('en-IN')}
                                                </td>
                                                <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent)' }}>
                                                    ₹{(p.net_salary || 0).toLocaleString('en-IN')}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    {confirmed[p.id] ? (
                                                        <span style={{ color: 'var(--accent)', fontWeight: 600 }}><CheckCircle size={14} /></span>
                                                    ) : rejected[p.id] ? (
                                                        <span style={{ color: 'var(--error)', fontWeight: 600 }}><XCircle size={14} /></span>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)' }}><FileText size={14} /></span>
                                                    )}
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button className="btn btn-outline btn-sm" onClick={() => setViewingPayslip(p)}>
                                                        <Eye style={{ width: '14px' }} /> View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Verification Screen ──────────────────────────────────────────────────
    return (
        <div className="layout-container" style={{ justifyContent: 'center', alignItems: 'center', padding: '1.5rem' }}>
            <div style={{ width: '100%', maxWidth: '480px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ margin: '0 auto 1.25rem', width: '64px', height: '64px', background: 'linear-gradient(135deg, var(--primary), #a855f7)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 10px 25px -5px rgba(99,102,241,0.4)' }}>
                        <ShieldCheck style={{ width: '32px', height: '32px' }} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)', margin: 0 }}>Employee Portal</h1>
                    <p style={{ marginTop: '0.5rem' }}>Verify your identity to access payslips.</p>
                </div>

                <div className="card" style={{ padding: '2rem' }}>
                    {verifyError && (
                        <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--error)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                            <AlertCircle size={18} /> {verifyError}
                        </div>
                    )}

                    <form onSubmit={handleVerify}>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label>Your Full Name</label>
                            <input
                                type="text"
                                value={verifyName}
                                onChange={e => setVerifyName(e.target.value)}
                                placeholder="Full Name"
                                required
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label>Employee ID</label>
                            <input
                                type="text"
                                value={verifyId}
                                onChange={e => setVerifyId(e.target.value)}
                                placeholder="Employee ID"
                                required
                            />
                        </div>

                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div className="form-group">
                                <label>Month</label>
                                <select value={verifyMonth} onChange={e => setVerifyMonth(e.target.value)} required>
                                    <option value="">Select Month</option>
                                    {months.map(m => (<option key={m} value={m}>{m}</option>))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Year</label>
                                <input type="number" value={verifyYear} onChange={e => setVerifyYear(e.target.value)} required />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={verifying}>
                            {verifying ? 'Verifying...' : 'Verify & View'}
                        </button>
                    </form>
                </div>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <button onClick={handleLogout} className="btn btn-outline btn-sm">
                        <LogOut size={14} /> Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
