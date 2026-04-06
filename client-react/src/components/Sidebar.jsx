import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Trash2, LogOut, User, X, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function Sidebar({ user, isOpen, setIsOpen }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <aside style={{
            width: isOpen ? '260px' : '0px',
            opacity: isOpen ? 1 : 0,
            overflow: 'hidden',
            background: '#ffffff', // Changed to light color
            color: '#111827', // Dark text
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            position: 'sticky',
            top: 0,
            flexShrink: 0,
            borderRight: '1px solid var(--border)',
            boxShadow: '4px 0 15px rgba(0,0,0,0.02)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            whiteSpace: 'nowrap',
            zIndex: 40
        }}>
            <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    <LayoutDashboard size={24} /> Dashboard
                </h2>
                <button 
                    onClick={() => setIsOpen(false)} 
                    style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', opacity: 0.7, padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
                >
                    <X size={20} />
                </button>
            </div>

            <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button 
                    onClick={() => navigate('/dashboard')} 
                    style={{ ...navButtonStyle, background: isActive('/dashboard') ? '#f3f4f6' : 'transparent', color: isActive('/dashboard') ? 'var(--primary)' : '#4b5563', fontWeight: isActive('/dashboard') ? '600' : '500' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = isActive('/dashboard') ? '#f3f4f6' : '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = isActive('/dashboard') ? '#f3f4f6' : 'transparent'}
                >
                    <LayoutDashboard size={18} /> Dashboard
                </button>
                <button 
                    onClick={() => navigate('/trash')} 
                    style={{ ...navButtonStyle, background: isActive('/trash') ? '#f3f4f6' : 'transparent', color: isActive('/trash') ? 'var(--primary)' : '#4b5563', fontWeight: isActive('/trash') ? '600' : '500' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = isActive('/trash') ? '#f3f4f6' : '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = isActive('/trash') ? '#f3f4f6' : 'transparent'}
                >
                    <Trash2 size={18} /> Trash
                </button>

                {user && user.role === 'admin' && (
                    <>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', padding: '0.75rem 1rem 0.25rem', marginTop: '0.5rem' }}>Payroll Status</div>
                        <button
                            onClick={() => navigate('/status/confirmed')}
                            style={{ ...navButtonStyle, background: isActive('/status/confirmed') ? '#f0fdf4' : 'transparent', color: isActive('/status/confirmed') ? '#16a34a' : '#4b5563', fontWeight: isActive('/status/confirmed') ? '600' : '500' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = isActive('/status/confirmed') ? '#f0fdf4' : '#f9fafb'}
                            onMouseLeave={(e) => e.currentTarget.style.background = isActive('/status/confirmed') ? '#f0fdf4' : 'transparent'}
                        >
                            <CheckCircle size={18} /> Confirmation Status
                        </button>
                        <button
                            onClick={() => navigate('/status/rejected')}
                            style={{ ...navButtonStyle, background: isActive('/status/rejected') ? '#fef2f2' : 'transparent', color: isActive('/status/rejected') ? '#dc2626' : '#4b5563', fontWeight: isActive('/status/rejected') ? '600' : '500' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = isActive('/status/rejected') ? '#fef2f2' : '#f9fafb'}
                            onMouseLeave={(e) => e.currentTarget.style.background = isActive('/status/rejected') ? '#fef2f2' : 'transparent'}
                        >
                            <XCircle size={18} /> Rejection Status
                        </button>
                        <button
                            onClick={() => navigate('/status/pending')}
                            style={{ ...navButtonStyle, background: isActive('/status/pending') ? '#fffbeb' : 'transparent', color: isActive('/status/pending') ? '#d97706' : '#4b5563', fontWeight: isActive('/status/pending') ? '600' : '500' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = isActive('/status/pending') ? '#fffbeb' : '#f9fafb'}
                            onMouseLeave={(e) => e.currentTarget.style.background = isActive('/status/pending') ? '#fffbeb' : 'transparent'}
                        >
                            <Clock size={18} /> Pending Status
                        </button>
                    </>
                )}
            </nav>

            <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {user && user.username ? user.username.charAt(0).toUpperCase() : <User size={20} />}
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>{user ? user.username : 'User'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'capitalize' }}>{user ? user.role : 'Employee'}</div>
                    </div>
                </div>
                <button onClick={handleLogout} style={{ ...navButtonStyle, padding: '0.5rem 0', color: '#ef4444' }} onMouseEnter={(e) => e.target.style.color = '#b91c1c'} onMouseLeave={(e) => e.target.style.color = '#ef4444'}>
                    <LogOut size={18} /> Sign Out
                </button>
            </div>
        </aside>
    );
}

const navButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '0.75rem 1rem',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '8px',
    textAlign: 'left',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
};
