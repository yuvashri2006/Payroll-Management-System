import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import Sidebar from '../components/Sidebar';
import { ArrowLeft, Trash2, RotateCcw, Menu, AlertCircle, CheckCircle } from 'lucide-react';

export default function Trash() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [trashedEmployees, setTrashedEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(userStr));
        fetchTrash();
    }, [navigate]);

    const fetchTrash = async () => {
        setLoading(true);
        try {
            const trashed = await api.getTrashedEmployees();
            setTrashedEmployees(trashed);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (id) => {
        try {
            await api.restoreEmployee(id);
            fetchTrash();
        } catch (err) {
            alert(err.message);
        }
    };

    const handlePermanentDelete = async (id) => {
        if (window.confirm('WARNING: This will permanently delete this employee and all their associated payroll records. This cannot be undone. Are you absolutely sure?')) {
            try {
                await api.permanentDeleteEmployee(id);
                fetchTrash();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    if (loading) {
        return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <Sidebar user={user} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <div className="dashboard-container fade-in">
                    {error && <div className="error-box" style={{ marginBottom: '1rem' }}>{error}</div>}
                    
                    <div className="page-header" style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
                                <Menu size={24} />
                            </button>
                            <div>
                                <h1 style={{ margin: 0 }}>Trash</h1>
                                <p style={{ margin: 0, marginTop: '0.25rem' }}>Deleted personnel records</p>
                            </div>
                        </div>
                        <div className="header-actions">
                            <button onClick={() => navigate('/dashboard')} className="btn btn-outline btn-sm">
                                <ArrowLeft style={{ width: '16px' }} /> Back to Dashboard
                            </button>
                        </div>
                    </div>

                    <div className="card-table">
                        {trashedEmployees.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                                <Trash2 style={{ width: '48px', height: '48px', marginBottom: '1rem', opacity: 0.5, display: 'inline-block' }} />
                                <h3 style={{ marginBottom: '0.5rem' }}>Trash is empty</h3>
                                <p>No deleted records found.</p>
                            </div>
                        ) : (
                            <table className="employee-table">
                                <thead>
                                    <tr>
                                        <th>Personnel</th>
                                        <th>Designation</th>
                                        <th>Action History</th>
                                        <th style={{ textAlign: 'right' }}>Recovery Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trashedEmployees.map(emp => {
                                        const joinYear = new Date(emp.date_hired).getFullYear().toString().slice(-2);
                                        const displayId = `EMP${joinYear}${emp.id.toString().padStart(3, '0')}`;
                                        return (
                                            <tr key={emp.id}>
                                                <td>
                                                    <div className="emp-name-cell">
                                                        <div className="emp-avatar" style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}>
                                                            {emp.first_name[0]}{emp.last_name[0]}
                                                        </div>
                                                        <div className="emp-info">
                                                            <span className="emp-name" style={{ textDecoration: 'line-through', opacity: 0.7 }}>
                                                                {emp.first_name} {emp.last_name}
                                                            </span>
                                                            <span className="emp-id-sub">{displayId}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span style={{ opacity: 0.7 }}>{emp.position}</span></td>
                                                <td>
                                                    <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
                                                        Soft Deleted
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div className="flex gap-2 justify-end">
                                                        <button 
                                                            className="btn btn-primary btn-sm" 
                                                            onClick={() => handleRestore(emp.id)}
                                                        >
                                                            <RotateCcw style={{ width: '14px' }} /> Restore
                                                        </button>
                                                        <button 
                                                            className="btn btn-outline btn-sm" 
                                                            onClick={() => handlePermanentDelete(emp.id)}
                                                            style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                                                        >
                                                            <Trash2 style={{ width: '14px' }} /> Delete Forever
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
