import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import Sidebar from '../components/Sidebar';
import { CheckCircle, XCircle, Clock, Inbox, Eye, Menu } from 'lucide-react';
import PayslipView from '../components/PayslipView';
import { ArrowLeft, Printer } from 'lucide-react';

const CONFIG = {
    confirmed: {
        label: 'Confirmation Status',
        icon: <CheckCircle style={{ width: '28px', color: '#16a34a' }} />,
        color: '#16a34a',
        bg: 'rgba(16,185,129,0.08)',
        border: 'rgba(16,185,129,0.2)',
        badge: { color: '#16a34a', bg: 'rgba(16,185,129,0.1)' },
        emptyMsg: 'No confirmed payslips yet.',
        emptyIcon: <CheckCircle style={{ width: '48px', height: '48px', opacity: 0.15, display: 'block', margin: '0 auto 1rem' }} />,
        filter: p => p.status === 'confirmed',
    },
    rejected: {
        label: 'Rejection Status',
        icon: <XCircle style={{ width: '28px', color: '#dc2626' }} />,
        color: '#dc2626',
        bg: 'rgba(239,68,68,0.08)',
        border: 'rgba(239,68,68,0.2)',
        badge: { color: '#dc2626', bg: 'rgba(239,68,68,0.1)' },
        emptyMsg: 'No rejected payslips.',
        emptyIcon: <XCircle style={{ width: '48px', height: '48px', opacity: 0.15, display: 'block', margin: '0 auto 1rem' }} />,
        filter: p => p.status === 'rejected',
    },
    pending: {
        label: 'Pending Status',
        icon: <Clock style={{ width: '28px', color: '#d97706' }} />,
        color: '#d97706',
        bg: 'rgba(245,158,11,0.08)',
        border: 'rgba(245,158,11,0.2)',
        badge: { color: '#d97706', bg: 'rgba(245,158,11,0.1)' },
        emptyMsg: 'No pending payslips.',
        emptyIcon: <Clock style={{ width: '48px', height: '48px', opacity: 0.15, display: 'block', margin: '0 auto 1rem' }} />,
        filter: p => !p.status || p.status === 'pending' || p.status === 'paid',
    },
};

export default function PayrollStatus() {
    const { type } = useParams(); // 'confirmed' | 'rejected' | 'pending'
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingPayslip, setViewingPayslip] = useState(null);

    const cfg = CONFIG[type] || CONFIG.pending;

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) { navigate('/login'); return; }
        const u = JSON.parse(userStr);
        if (u.role !== 'admin') { navigate('/portal'); return; }
        setUser(u);
    }, [navigate]);

    useEffect(() => {
        api.getPayrolls()
            .then(data => setPayrolls(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [type]);

    const filtered = payrolls.filter(cfg.filter);

    if (viewingPayslip) {
        return (
            <div className="layout-container">
                <Sidebar user={user} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
                <div className="main-content">
                    <div className="dashboard-container fade-in">
                        <div className="page-header no-print">
                            <button onClick={() => setViewingPayslip(null)} className="btn btn-outline btn-sm">
                                <ArrowLeft style={{ width: '16px' }} /> Back
                            </button>
                            <button className="btn btn-outline" onClick={() => window.print()}>
                                <Printer style={{ width: '18px' }} /> Print
                            </button>
                        </div>
                        <PayslipView p={viewingPayslip} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="layout-container">
            <Sidebar user={user} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <div className="main-content">
                <div className="dashboard-container fade-in">

                    {/* Header */}
                    <div className="page-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
                                <Menu size={24} />
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: cfg.bg, border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {cfg.icon}
                                </div>
                                <div>
                                    <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{cfg.label}</h1>
                                    <p style={{ margin: 0, marginTop: '0.2rem', fontSize: '0.9rem' }}>
                                        {filtered.length} record{filtered.length !== 1 ? 's' : ''} found
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary pill */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: '12px', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: cfg.color }}>{filtered.length}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total {cfg.label}</div>
                        </div>
                        {type === 'rejected' && (
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                                    ₹{filtered.reduce((s, p) => s + (p.net_salary || 0), 0).toLocaleString('en-IN')}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Disputed Amount</div>
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    <div className="card-table">
                        {loading ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
                        ) : filtered.length === 0 ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                {cfg.emptyIcon}
                                <div style={{ fontWeight: 600 }}>{cfg.emptyMsg}</div>
                            </div>
                        ) : (
                            <table className="employee-table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Period</th>
                                        <th style={{ textAlign: 'right' }}>Basic Salary</th>
                                        <th style={{ textAlign: 'right' }}>Net Salary</th>
                                        {type === 'rejected' && <th>Rejection Reason</th>}
                                        <th style={{ textAlign: 'center' }}>Status</th>
                                        <th style={{ textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(p => (
                                        <tr key={p.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                                                        {p.first_name?.[0]}{p.last_name?.[0]}
                                                    </div>
                                                    <span style={{ fontWeight: 700 }}>{p.first_name} {p.last_name}</span>
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 500 }}>{p.month} {p.year}</td>
                                            <td style={{ textAlign: 'right' }}>₹{(p.basic_salary || 0).toLocaleString('en-IN')}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 700, color: type === 'rejected' ? cfg.color : 'var(--accent)' }}>
                                                ₹{(p.net_salary || 0).toLocaleString('en-IN')}
                                            </td>
                                            {type === 'rejected' && (
                                                <td style={{ fontSize: '0.85rem', color: cfg.color, maxWidth: '220px' }}>
                                                    {p.rejection_reason || <span style={{ fontStyle: 'italic', opacity: 0.6 }}>No reason provided</span>}
                                                </td>
                                            )}
                                            <td style={{ textAlign: 'center' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: cfg.badge.color, fontWeight: 600, fontSize: '0.78rem', background: cfg.badge.bg, padding: '0.3rem 0.8rem', borderRadius: '999px' }}>
                                                    {type === 'confirmed' && <CheckCircle style={{ width: '12px' }} />}
                                                    {type === 'rejected' && <XCircle style={{ width: '12px' }} />}
                                                    {type === 'pending' && <Clock style={{ width: '12px' }} />}
                                                    {type === 'confirmed' ? 'Confirmed' : type === 'rejected' ? 'Rejected' : 'Awaiting'}
                                                </span>
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
