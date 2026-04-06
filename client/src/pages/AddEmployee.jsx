import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import Sidebar from '../components/Sidebar';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function AddEmployee() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(userStr));
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formData = new FormData(e.target);
        const employeeData = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            email: formData.get('email'),
            position: formData.get('position'),
            salary: parseFloat(formData.get('salary')) * 100000,
            date_hired: formData.get('date_hired')
        };

        try {
            await api.addEmployee(employeeData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <Sidebar user={user} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <div className="dashboard-container fade-in">
                    <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                        <div className="header-info">
                            <button onClick={() => navigate('/dashboard')} className="btn btn-outline btn-sm" style={{ marginBottom: '1.5rem' }}>
                                <ArrowLeft style={{ width: '16px' }} /> Back to Dashboard
                            </button>
                            <h1>New Employee</h1>
                            <p>Enter the details to add a new member to the team.</p>
                        </div>
                    </div>

                    <div className="card" style={{ maxWidth: '600px' }}>
                        {error && (
                            <div className="error-box" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--radius-md)' }}>
                                <AlertCircle style={{ width: '18px' }} />
                                <span>{error}</span>
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input type="text" name="first_name" placeholder="John" required />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input type="text" name="last_name" placeholder="Doe" required />
                                </div>
                            </div>
                            
                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label>Email Address</label>
                                <input type="email" name="email" placeholder="john.doe@company.com" required />
                            </div>

                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label>Job Position</label>
                                <input type="text" name="position" placeholder="Software Engineer" required />
                            </div>

                            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                <div className="form-group">
                                    <label>Annual Package (LPA)</label>
                                    <input type="number" name="salary" placeholder="5.5" min="0" step="any" required />
                                </div>
                                <div className="form-group">
                                    <label>Date Hired</label>
                                    <input type="date" name="date_hired" defaultValue={new Date().toISOString().split('T')[0]} required />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                                    {loading ? 'Adding...' : 'Add Employee'}
                                </button>
                                <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-outline" style={{ flex: 1 }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
