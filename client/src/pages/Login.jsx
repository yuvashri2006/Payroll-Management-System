import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, AlertCircle, User, Lock, ArrowRight, Shield } from 'lucide-react';
import { api } from '../api';

export default function Login() {
    const [role, setRole] = useState('admin');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const forcedRole = searchParams.get('role');
        if (forcedRole === 'employee') {
            setRole('employee');
        }
    }, [searchParams]);

    const handleTabClick = (newRole) => {
        if (searchParams.get('role') === 'employee') return; // forced employee mode
        setRole(newRole);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            const data = await api.login(username, password, role);

            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
                if (data.user.role === 'employee') {
                    navigate('/portal');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const isEmployeeForced = searchParams.get('role') === 'employee';

    return (
        <div className="login-page-wrapper fade-in" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at top right, var(--primary-light), transparent), radial-gradient(circle at bottom left, rgba(99, 102, 241, 0.05), transparent)', backgroundColor: 'var(--bg-main)' }}>
            <div className="login-container" style={{ width: '100%', maxWidth: '440px', padding: '3rem', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-premium)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ margin: '0 auto 1.5rem', width: '64px', height: '64px', background: 'linear-gradient(135deg, var(--primary), #a855f7)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)' }}>
                        <ShieldCheck style={{ width: '32px', height: '32px' }} />
                    </div>
                </div>

                {error && (
                    <div className="error-box" style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: 'var(--error)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>
                        <AlertCircle style={{ width: '18px' }} />
                        <span>{error}</span>
                    </div>
                )}

                <div style={{ marginBottom: '2.5rem', background: 'var(--bg-main)', padding: '0.5rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.5rem', border: '1px solid var(--border)' }}>
                    {!isEmployeeForced && (
                        <button 
                            type="button" 
                            className={`btn ${role === 'admin' ? 'active' : ''}`}
                            onClick={() => handleTabClick('admin')}
                            style={{ flex: 1, borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem', transition: 'all 0.2s', background: role === 'admin' ? 'white' : 'transparent', color: role === 'admin' ? 'var(--secondary)' : 'var(--text-muted)' }}
                        >
                            Administrator
                        </button>
                    )}
                    <button 
                        type="button" 
                        className={`btn ${role === 'employee' ? 'active' : ''}`}
                        onClick={() => handleTabClick('employee')}
                        style={{ flex: 1, borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem', transition: 'all 0.2s', background: role === 'employee' ? 'white' : 'transparent', color: role === 'employee' ? 'var(--secondary)' : 'var(--text-muted)' }}
                    >
                        Employee
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                            {role === 'admin' ? 'Admin Credential' : 'Corporate Identity'}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <User style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '18px', color: 'var(--text-muted)' }} />
                            <input 
                                type="text" 
                                placeholder={role === 'admin' ? "Full Name or Username" : "Employee Legal Name"}
                                required 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', fontSize: '1rem', transition: 'all 0.2s' }} 
                            />
                        </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                            Security Key
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '18px', color: 'var(--text-muted)' }} />
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', fontSize: '1rem', transition: 'all 0.2s' }} 
                            />
                        </div>
                    </div>
                    
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 700, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}>
                        Establish Secure Connection <ArrowRight style={{ width: '18px' }} />
                    </button>
                </form>

                <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                        <Shield style={{ width: '12px', color: 'var(--primary)' }} /> 
                        Protected by Enterprise Security Standards
                    </p>
                </div>
            </div>
            <style>{`
                input:focus {
                    outline: none;
                    border-color: var(--primary) !important;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                }
            `}</style>
        </div>
    );
}
