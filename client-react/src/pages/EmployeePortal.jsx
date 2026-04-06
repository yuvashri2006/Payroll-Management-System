import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import PayslipView from '../components/PayslipView';
import {
    LogOut, ArrowLeft, Eye, Printer, CheckCircle,
    FileText, ShieldCheck, Inbox, AlertCircle, XCircle, MessageSquare
} from 'lucide-react';

export default function EmployeePortal() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

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

        // Validate year vs hiring year from ID prefix
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

            // Seed UI state from persisted DB status
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
        } catch (e) { /* silent — still update UI */ }
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
        } catch (e) { /* silent — still update UI */ }
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
            <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
                {rejectModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
                        <div className="card fade-in" style={{ width: '100%', maxWidth: '440px', padding: '2rem', position: 'relative' }}>
                            <button onClick={() => setRejectModal(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <XCircle style={{ width: '20px', color: 'var(--error)' }} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Reject Payslip</h3>
                                    <p style={{ margin: 0, fontSize: '0.8rem' }}>{rejectModal.month} {rejectModal.year}</p>
                                </div>
                            </div>
                            <form onSubmit={handleRejectSubmit}>
                                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <MessageSquare style={{ width: '14px' }} /> Reason for Rejection
                                    </label>
                                    <textarea
                                        autoFocus
                                        value={rejectReason}
                                        onChange={e => setRejectReason(e.target.value)}
                                        placeholder="Describe the issue (e.g. incorrect deductions, wrong basic salary…)"
                                        rows={4}
                                        style={{ 
                                            width: '100%', 
                                            padding: '0.875rem', 
                                            borderRadius: 'var(--radius-md)', 
                                            border: '1px solid var(--border)', 
                                            background: 'var(--bg-main)', 
                                            fontFamily: 'inherit', 
                                            fontSize: '1rem', 
                                            resize: 'vertical',
                                            outline: 'none',
                                            transition: 'border-color 0.2s, box-shadow 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = 'var(--primary)';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = 'var(--border)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button type="submit" className="btn" style={{ flex: 1, background: 'var(--error)', color: 'white', boxShadow: '0 4px 14px rgba(239,68,68,0.25)' }}>
                                        <XCircle style={{ width: '16px' }} /> Submit Rejection
                                    </button>
                                    <button type="button" onClick={() => setRejectModal(null)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                <div className="dashboard-container fade-in">
                    <div className="dashboard-header no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <button onClick={() => setViewingPayslip(null)} className="btn btn-outline btn-sm">
                            <ArrowLeft style={{ width: '16px' }} /> Back to History
                        </button>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            {isConfirmed && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent)', fontWeight: 700, fontSize: '0.875rem' }}>
                                    <CheckCircle style={{ width: '16px' }} /> Confirmed
                                </span>
                            )}
                            {isRejected && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--error)', fontWeight: 700, fontSize: '0.875rem' }}>
                                    <XCircle style={{ width: '16px' }} /> Rejected
                                </span>
                            )}
                            {!isConfirmed && (
                                <button onClick={() => handleConfirm(viewingPayslip.id)} className="btn btn-primary" style={{ background: 'var(--accent)', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}>
                                    <CheckCircle style={{ width: '18px' }} /> Confirm
                                </button>
                            )}
                            {!isRejected && (
                                <button onClick={() => openRejectModal(viewingPayslip)} className="btn" style={{ background: 'var(--error)', color: 'white', boxShadow: '0 4px 14px rgba(239,68,68,0.25)' }}>
                                    <XCircle style={{ width: '18px' }} /> Reject
                                </button>
                            )}
                            <button className="btn btn-outline" onClick={() => window.print()}>
                                <Printer style={{ width: '18px' }} /> Print
                            </button>
                        </div>
                    </div>

                    {isConfirmed && (
                        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--accent)', padding: '0.875rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                            <CheckCircle style={{ width: '18px' }} />
                            You have confirmed receipt of this payslip for {viewingPayslip.month} {viewingPayslip.year}.
                        </div>
                    )}
                    {isRejected && (
                        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--error)', padding: '0.875rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                                <XCircle style={{ width: '18px' }} /> Payslip Rejected
                            </div>
                            <div style={{ fontWeight: 500 }}>Reason: {isRejected}</div>
                        </div>
                    )}

                    <PayslipView p={viewingPayslip} />
                </div>
            </div>
        );
    }

    // ─── Payroll History List ─────────────────────────────────────────────────
    if (payrolls !== null) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
                {rejectModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
                        <div className="card fade-in" style={{ width: '100%', maxWidth: '440px', padding: '2rem', position: 'relative' }}>
                            <button onClick={() => setRejectModal(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <XCircle style={{ width: '20px', color: 'var(--error)' }} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Reject Payslip</h3>
                                    <p style={{ margin: 0, fontSize: '0.8rem' }}>{rejectModal.month} {rejectModal.year}</p>
                                </div>
                            </div>
                            <form onSubmit={handleRejectSubmit}>
                                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <MessageSquare style={{ width: '14px' }} /> Reason for Rejection
                                    </label>
                                    <textarea
                                        autoFocus
                                        value={rejectReason}
                                        onChange={e => setRejectReason(e.target.value)}
                                        placeholder="Describe the issue (e.g. incorrect deductions, wrong basic salary…)"
                                        rows={4}
                                        style={{ 
                                            width: '100%', 
                                            padding: '0.875rem', 
                                            borderRadius: 'var(--radius-md)', 
                                            border: '1px solid var(--border)', 
                                            background: 'var(--bg-main)', 
                                            fontFamily: 'inherit', 
                                            fontSize: '1rem', 
                                            resize: 'vertical',
                                            outline: 'none',
                                            transition: 'border-color 0.2s, box-shadow 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = 'var(--primary)';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = 'var(--border)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button type="submit" className="btn" style={{ flex: 1, background: 'var(--error)', color: 'white', boxShadow: '0 4px 14px rgba(239,68,68,0.25)' }}>
                                        <XCircle style={{ width: '16px' }} /> Submit Rejection
                                    </button>
                                    <button type="button" onClick={() => setRejectModal(null)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                <div className="dashboard-container fade-in">
                    <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
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
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {p.company_name || ''}
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                                ₹{(p.basic_salary || 0).toLocaleString('en-IN')}
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent)' }}>
                                                ₹{(p.net_salary || 0).toLocaleString('en-IN')}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {confirmed[p.id] ? (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent)', fontWeight: 600, fontSize: '0.8rem' }}>
                                                        <CheckCircle style={{ width: '14px' }} /> Confirmed
                                                    </span>
                                                ) : rejected[p.id] ? (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--error)', fontWeight: 600, fontSize: '0.8rem' }}>
                                                        <XCircle style={{ width: '14px' }} /> Rejected
                                                    </span>
                                                ) : (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem' }}>
                                                        <FileText style={{ width: '14px' }} /> Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <button className="btn btn-outline btn-sm" onClick={() => setViewingPayslip(p)}>
                                                        <Eye style={{ width: '14px' }} /> View
                                                    </button>
                                                    {!confirmed[p.id] && (
                                                        <button className="btn btn-outline btn-sm" onClick={() => handleConfirm(p.id)} style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>
                                                            <CheckCircle style={{ width: '14px' }} /> Confirm
                                                        </button>
                                                    )}
                                                    {!rejected[p.id] && (
                                                        <button className="btn btn-outline btn-sm" onClick={() => openRejectModal(p)} style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
                                                            <XCircle style={{ width: '14px' }} /> Reject
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ─── Verification Screen ──────────────────────────────────────────────────
    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            {rejectModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
                    <div className="card fade-in" style={{ width: '100%', maxWidth: '440px', padding: '2rem', position: 'relative' }}>
                        <button onClick={() => setRejectModal(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <XCircle style={{ width: '20px', color: 'var(--error)' }} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Reject Payslip</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem' }}>{rejectModal.month} {rejectModal.year}</p>
                            </div>
                        </div>
                        <form onSubmit={handleRejectSubmit}>
                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <MessageSquare style={{ width: '14px' }} /> Reason for Rejection
                                </label>
                                <textarea
                                    autoFocus
                                    value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)}
                                    placeholder="Describe the issue (e.g. incorrect deductions, wrong basic salary…)"
                                    rows={4}
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.875rem', 
                                        borderRadius: 'var(--radius-md)', 
                                        border: '1px solid var(--border)', 
                                        background: 'var(--bg-main)', 
                                        fontFamily: 'inherit', 
                                        fontSize: '1rem', 
                                        resize: 'vertical',
                                        outline: 'none',
                                        transition: 'border-color 0.2s, box-shadow 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'var(--primary)';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'var(--border)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button type="submit" className="btn" style={{ flex: 1, background: 'var(--error)', color: 'white', boxShadow: '0 4px 14px rgba(239,68,68,0.25)' }}>
                                    <XCircle style={{ width: '16px' }} /> Submit Rejection
                                </button>
                                <button type="button" onClick={() => setRejectModal(null)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <div style={{ width: '100%', maxWidth: '480px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ margin: '0 auto 1.25rem', width: '64px', height: '64px', background: 'linear-gradient(135deg, var(--primary), #a855f7)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 10px 25px -5px rgba(99,102,241,0.4)' }}>
                        <ShieldCheck style={{ width: '32px', height: '32px' }} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)', margin: 0 }}>Employee Portal</h1>
                    <p style={{ marginTop: '0.5rem' }}>
                        {user ? <>Welcome, <strong>{user.username}</strong>. Verify your identity to view payslips.</> : 'Verify your identity to access payslips.'}
                    </p>
                </div>

                <div className="card" style={{ padding: '2rem' }}>
                    {verifyError && (
                        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--error)', padding: '0.875rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                            <AlertCircle style={{ width: '18px', flexShrink: 0 }} />
                            {verifyError}
                        </div>
                    )}

                    <form onSubmit={handleVerify}>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label>Your Full Name</label>
                            <input
                                type="text"
                                value={verifyName}
                                onChange={e => setVerifyName(e.target.value)}
                                placeholder="Full Name as per records"
                                required
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label>Employee ID <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(e.g. 26001)</span></label>
                            <input
                                type="text"
                                value={verifyId}
                                onChange={e => setVerifyId(e.target.value)}
                                placeholder="YYNNN format"
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div className="form-group">
                                <label>Month</label>
                                <select
                                    value={verifyMonth}
                                    onChange={e => setVerifyMonth(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '0.5rem 0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)', fontFamily: 'inherit', fontSize: '0.9rem' }}
                                >
                                    <option value="">Select Month</option>
                                    {months.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Year</label>
                                <input
                                    type="number"
                                    value={verifyYear}
                                    onChange={e => setVerifyYear(e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder="2026"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={verifying}>
                            <ShieldCheck style={{ width: '18px' }} />
                            {verifying ? 'Verifying...' : 'Verify & View Payslips'}
                        </button>
                    </form>
                </div>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <button onClick={handleLogout} className="btn btn-outline btn-sm">
                        <LogOut style={{ width: '14px' }} /> Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
