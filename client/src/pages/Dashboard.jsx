import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import PayslipView from '../components/PayslipView';
import Sidebar from '../components/Sidebar';
import { 
    Trash2, Plus, LogOut, Users, Banknote, Calendar, Search, 
    Inbox, Eye, ArrowLeft, Printer, UserPlus, Calculator, Edit, CheckCircle, AlertCircle, Menu
} from 'lucide-react';

// A simple local Toast Notification component could go here or app-level, for now alert is used or simple state.
// We'll use a simple error state for the whole dashboard for brevity.

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [payrolls, setPayrolls] = useState([]);
    const [activeTab, setActiveTab] = useState('employees');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [viewingPayslip, setViewingPayslip] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPayrollModal, setShowPayrollModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    
    // Live payroll calculation states
    const [payMonth, setPayMonth] = useState('');
    const [payYear, setPayYear] = useState('');
    const [payBasic, setPayBasic] = useState(0);
    const [payAllowances, setPayAllowances] = useState(0);
    const [payLeave, setPayLeave] = useState(0);
    const [payPF, setPayPF] = useState(0);
    const [payInsurance, setPayInsurance] = useState(0);
    const [payTaxPercent, setPayTaxPercent] = useState(10);
    const [payAnnual, setPayAnnual] = useState(0);

    // Initial Load
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(userStr));
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const emps = await api.getEmployees();
            setEmployees(emps);
            const pays = await api.getPayrolls();
            setPayrolls(pays);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEmployee = async (id) => {
        if (window.confirm('Move this employee to trash?')) {
            try {
                await api.deleteEmployee(id);
                fetchData();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const handleDeletePayroll = async (id) => {
        if (window.confirm('Irreversibly delete this transaction?')) {
            try {
                await api.deletePayroll(id);
                fetchData();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const data = {
                first_name: formData.get('first_name'),
                last_name: formData.get('last_name'),
                email: formData.get('email'),
                position: formData.get('position'),
                salary: parseFloat(formData.get('salary')) * 100000,
                date_hired: formData.get('date_hired')
            };
            await api.updateEmployee(selectedEmployee.id, data);
            setShowEditModal(false);
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    const basicNum = Number(payBasic) || 0;
    const allowancesNum = Number(payAllowances) || 0;
    const leaveNum = Number(payLeave) || 0;
    const pfNum = Number(payPF) || 0;
    const insuranceNum = Number(payInsurance) || 0;
    const taxPercentNum = Number(payTaxPercent) || 0;

    const currentTax = Math.round((basicNum + allowancesNum) * (taxPercentNum / 100));
    const currentDeductions = leaveNum + currentTax + insuranceNum + pfNum;
    const currentNet = Math.max(0, (basicNum + allowancesNum) - currentDeductions);

    const handleRunPayroll = (emp) => {
        setSelectedEmployee(emp);
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        setPayMonth(monthNames[new Date().getMonth()]);
        setPayYear(new Date().getFullYear());
        
        setPayAnnual(emp.salary);
        const basic = Math.round(emp.salary / 12);
        setPayBasic(basic);
        setPayAllowances(0);
        setPayLeave(0);
        setPayPF(0);
        setPayInsurance(0);
        
        const isTaxFree = (emp.salary / 100000) <= 3.0;
        setPayTaxPercent(isTaxFree ? 0 : 10);
        
        setShowPayrollModal(true);
    };

    const handlePayrollSubmit = async (e) => {
        e.preventDefault();
        try {
            const payrollData = {
                employee_id: selectedEmployee.id,
                month: payMonth,
                year: Number(payYear) || new Date().getFullYear(),
                basic_salary: basicNum,
                allowances: allowancesNum,
                leave_deduction: leaveNum,
                pf_deduction: pfNum,
                tax_deduction: currentTax,
                insurance_deduction: insuranceNum,
                net_salary: currentNet
            };

            const result = await api.postPayroll(payrollData);
            setShowPayrollModal(false);
            
            const updatedPayrolls = await api.getPayrolls();
            setPayrolls(updatedPayrolls);
            
            const slip = updatedPayrolls.find(p => p.id === result.id);
            if (slip) setViewingPayslip(slip);
            
        } catch (err) {
            alert(err.message);
        }
    };

    const totalMonthlySalary = useMemo(() => {
        return employees.reduce((acc, emp) => acc + ((emp.salary || 0) / 12), 0);
    }, [employees]);

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp =>
            `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (emp.position || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [employees, searchQuery]);

    const filteredPayrolls = useMemo(() => {
        return payrolls.filter(p =>
            `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [payrolls, searchQuery]);

    // Render Payslip mode
    if (viewingPayslip) {
        return (
            <div className="layout-container">
                <Sidebar user={user} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
                <div className="main-content">
                    <div className="dashboard-container fade-in">
                        <div className="page-header no-print">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
                                    <Menu size={24} />
                                </button>
                                <div>
                                    <button onClick={() => setViewingPayslip(null)} className="btn btn-outline btn-sm" style={{ marginBottom: '0.5rem' }}>
                                        <ArrowLeft style={{ width: '16px' }} /> Return to Ledger
                                    </button>
                                    <h1 style={{ margin: 0 }}>Transaction Record</h1>
                                </div>
                            </div>
                            <button className="btn btn-primary no-print" onClick={() => window.print()}>
                                <Printer style={{ width: '18px' }} /> Generate Printout
                            </button>
                        </div>
                        <PayslipView p={viewingPayslip} />
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;
    }

    return (
        <div className="layout-container">
            <Sidebar user={user} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <div className="main-content">
                <div className="dashboard-container fade-in">
                    {error && <div className="error-box" style={{ marginBottom: '1rem' }}>{error}</div>}
            
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <div>
                        <h1 style={{ margin: 0 }}>Payroll Dashboard</h1>
                        <p style={{ margin: 0, marginTop: '0.25rem' }}>Enterprise Management System</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button onClick={() => navigate('/add-employee')} className="btn btn-primary">
                        <Plus style={{ width: '18px' }} /> Add New Employee
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon"><Users /></div>
                    <div className="stat-content">
                        <h4>Total Workforce</h4>
                        <div className="value">{employees.length}</div>
                    </div>
                </div>
                <div className="stat-card" style={{ '--primary': 'var(--accent)' }}>
                    <div className="stat-icon" style={{ color: 'var(--accent)', background: 'rgba(16, 185, 129, 0.1)' }}><Banknote /></div>
                    <div className="stat-content">
                        <h4>Monthly Expenditure</h4>
                        <div className="value">₹{Math.round(totalMonthlySalary || 0).toLocaleString('en-IN')}</div>
                    </div>
                </div>
                <div className="stat-card" style={{ '--primary': 'var(--warning)' }}>
                    <div className="stat-icon" style={{ color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.1)' }}><Calendar /></div>
                    <div className="stat-content">
                        <h4>Active Cycle</h4>
                        <div className="value">{new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date())}</div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                <div className="tabs">
                    <button onClick={() => setActiveTab('employees')} className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}>Direct Reports</button>
                    <button onClick={() => setActiveTab('history')} className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}>Transaction Log</button>
                </div>
                <div className="search-box">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <input 
                            type="text" 
                            placeholder={activeTab === 'employees' ? "Search personnel..." : "Search transactions..."} 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ width: '320px', background: 'var(--bg-card)' }} 
                        />
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            {activeTab === 'employees' && (
                <div className="tab-content">
                    <div className="card-table">
                        {filteredEmployees.length === 0 ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <UserPlus style={{ width: '48px', height: '48px', opacity: 0.2, margin: '0 auto 1rem' }} />
                                <div>No active personnel found.</div>
                            </div>
                        ) : (
                            <table className="employee-table">
                                <thead>
                                    <tr>
                                        <th>Personnel</th>
                                        <th>Designation</th>
                                        <th style={{ textAlign: 'right' }}>Annual CTC</th>
                                        <th>Effective Date</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.map(emp => {
                                        const joinYear = new Date(emp.date_hired).getFullYear().toString().slice(-2);
                                        const displayId = `EMP${joinYear}${emp.id.toString().padStart(3, '0')}`;
                                        return (
                                            <tr key={emp.id}>
                                                <td>
                                                    <div className="emp-name-cell">
                                                        <div className="emp-avatar">{emp.first_name[0]}{emp.last_name[0]}</div>
                                                        <div className="emp-info">
                                                            <span className="emp-name">{emp.first_name} {emp.last_name}</span>
                                                            <span className="emp-id-sub">{displayId}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span style={{ fontWeight: 500 }}>{emp.position}</span></td>
                                                <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{(emp.salary / 100000).toFixed(2)} LPA</td>
                                                <td>{new Date(emp.date_hired).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div className="flex gap-2 justify-end">
                                                        <button 
                                                            className="btn btn-outline btn-sm" 
                                                            onClick={() => handleRunPayroll(emp)}
                                                            title="Generate Payslip"
                                                        >
                                                            <Calculator style={{ width: '14px' }} />
                                                        </button>
                                                        <button 
                                                            className="btn btn-outline btn-sm edit-btn" 
                                                            onClick={() => { setSelectedEmployee(emp); setShowEditModal(true); }}
                                                        >
                                                            <Edit style={{ width: '14px' }} />
                                                        </button>
                                                        <button 
                                                            className="btn btn-outline btn-sm delete-emp-btn" 
                                                            onClick={() => handleDeleteEmployee(emp.id)}
                                                            style={{ color: 'var(--error)' }}
                                                        >
                                                            <Trash2 style={{ width: '14px' }} />
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
            )}

            {activeTab === 'history' && (
                <div className="tab-content">
                    <div className="card-table">
                        {filteredPayrolls.length === 0 ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <Inbox style={{ width: '48px', height: '48px', opacity: 0.2, margin: '0 auto 1rem' }} />
                                <div>No transactions recorded yet.</div>
                            </div>
                        ) : (
                            <table className="employee-table">
                                <thead>
                                    <tr>
                                        <th>Beneficiary</th>
                                        <th>Period</th>
                                        <th style={{ textAlign: 'right' }}>Total Payout</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPayrolls.map(p => (
                                        <tr key={p.id}>
                                            <td>
                                                <div className="emp-name" style={{ fontWeight: 700 }}>{p.first_name} {p.last_name}</div>
                                            </td>
                                            <td><span style={{ fontWeight: 500 }}>{p.month && p.year ? `${p.month} ${p.year}` : 'N/A'}</span></td>
                                            <td style={{ textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>₹{(p.net_salary || 0).toLocaleString('en-IN')}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div className="flex gap-2 justify-end">
                                                    <button className="btn btn-outline btn-sm" onClick={() => setViewingPayslip(p)}>
                                                        <Eye style={{ width: '14px' }} />
                                                    </button>
                                                    <button className="btn btn-outline btn-sm" onClick={() => handleDeletePayroll(p.id)} style={{ color: 'var(--error)' }}>
                                                        <Trash2 style={{ width: '14px' }} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* Confirmed Tab */}
            {activeTab === 'confirmed' && (
                <div className="tab-content">
                    <div className="card-table">
                        {payrolls.filter(p => p.status === 'confirmed').length === 0 ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <CheckCircle style={{ width: '48px', height: '48px', opacity: 0.2, margin: '0 auto 1rem', display: 'block' }} />
                                <div>No confirmed payslips yet.</div>
                            </div>
                        ) : (
                            <table className="employee-table">
                                <thead><tr>
                                    <th>Employee</th><th>Period</th>
                                    <th style={{ textAlign: 'right' }}>Net Salary</th>
                                    <th style={{ textAlign: 'center' }}>Status</th>
                                </tr></thead>
                                <tbody>
                                    {payrolls.filter(p => p.status === 'confirmed').map(p => (
                                        <tr key={p.id}>
                                            <td style={{ fontWeight: 700 }}>{p.first_name} {p.last_name}</td>
                                            <td style={{ fontWeight: 500 }}>{p.month} {p.year}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent)' }}>₹{(p.net_salary || 0).toLocaleString('en-IN')}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent)', fontWeight: 600, fontSize: '0.8rem', background: 'rgba(16,185,129,0.1)', padding: '0.25rem 0.75rem', borderRadius: '999px' }}>
                                                    <CheckCircle style={{ width: '13px' }} /> Confirmed
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* Rejected Tab */}
            {activeTab === 'rejected' && (
                <div className="tab-content">
                    <div className="card-table">
                        {payrolls.filter(p => p.status === 'rejected').length === 0 ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <AlertCircle style={{ width: '48px', height: '48px', opacity: 0.2, margin: '0 auto 1rem', display: 'block' }} />
                                <div>No rejected payslips.</div>
                            </div>
                        ) : (
                            <table className="employee-table">
                                <thead><tr>
                                    <th>Employee</th><th>Period</th>
                                    <th style={{ textAlign: 'right' }}>Net Salary</th>
                                    <th>Rejection Reason</th>
                                </tr></thead>
                                <tbody>
                                    {payrolls.filter(p => p.status === 'rejected').map(p => (
                                        <tr key={p.id}>
                                            <td style={{ fontWeight: 700 }}>{p.first_name} {p.last_name}</td>
                                            <td style={{ fontWeight: 500 }}>{p.month} {p.year}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--error)' }}>₹{(p.net_salary || 0).toLocaleString('en-IN')}</td>
                                            <td style={{ fontSize: '0.85rem', color: 'var(--error)', fontStyle: p.rejection_reason ? 'normal' : 'italic' }}>
                                                {p.rejection_reason || 'No reason provided'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* Pending Tab */}
            {activeTab === 'pending' && (
                <div className="tab-content">
                    <div className="card-table">
                        {payrolls.filter(p => !p.status || p.status === 'pending' || p.status === 'paid').length === 0 ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <Inbox style={{ width: '48px', height: '48px', opacity: 0.2, margin: '0 auto 1rem', display: 'block' }} />
                                <div>No pending payslips.</div>
                            </div>
                        ) : (
                            <table className="employee-table">
                                <thead><tr>
                                    <th>Employee</th><th>Period</th>
                                    <th style={{ textAlign: 'right' }}>Net Salary</th>
                                    <th style={{ textAlign: 'center' }}>Status</th>
                                </tr></thead>
                                <tbody>
                                    {payrolls.filter(p => !p.status || p.status === 'pending' || p.status === 'paid').map(p => (
                                        <tr key={p.id}>
                                            <td style={{ fontWeight: 700 }}>{p.first_name} {p.last_name}</td>
                                            <td style={{ fontWeight: 500 }}>{p.month} {p.year}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent)' }}>₹{(p.net_salary || 0).toLocaleString('en-IN')}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem', background: 'rgba(100,116,139,0.1)', padding: '0.25rem 0.75rem', borderRadius: '999px' }}>
                                                    Awaiting Response
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {showEditModal && selectedEmployee && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Edit Personnel File</h3>
                            <button onClick={() => setShowEditModal(false)} className="close-btn">&times;</button>
                        </div>
                        <form onSubmit={handleEditSave}>
                            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input type="text" name="first_name" defaultValue={selectedEmployee.first_name} required />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input type="text" name="last_name" defaultValue={selectedEmployee.last_name} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Corporate CRM Email</label>
                                <input type="email" name="email" defaultValue={selectedEmployee.email} required />
                            </div>
                            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Designation</label>
                                    <input type="text" name="position" defaultValue={selectedEmployee.position} required />
                                </div>
                                <div className="form-group">
                                    <label>Annual CTC (in LPA)</label>
                                    <input type="number" name="salary" step="any" defaultValue={(selectedEmployee.salary / 100000).toFixed(2)} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Effective Date</label>
                                <input type="date" name="date_hired" defaultValue={selectedEmployee.date_hired ? selectedEmployee.date_hired.split('T')[0] : ''} required />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Update Records</button>
                        </form>
                    </div>
                </div>
            )}

            {showPayrollModal && selectedEmployee && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3>Run Payroll: {selectedEmployee.first_name} {selectedEmployee.last_name}</h3>
                            <button onClick={() => setShowPayrollModal(false)} className="close-btn">&times;</button>
                        </div>
                        <form onSubmit={handlePayrollSubmit}>
                            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Month</label>
                                    <input type="text" value={payMonth} onChange={e => setPayMonth(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Year</label>
                                    <input type="number" value={payYear} onChange={e => setPayYear(e.target.value === '' ? '' : Number(e.target.value))} required />
                                </div>
                            </div>
                            
                            <h4 style={{ margin: '1rem 0 0.5rem', color: 'var(--primary)' }}>Earnings</h4>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>Annual Package (₹)</label>
                                <input type="number" value={payAnnual} onChange={e => {
                                    const val = e.target.value;
                                    setPayAnnual(val === '' ? '' : Number(val));
                                    setPayBasic(val === '' ? '' : Math.round(Number(val) / 12));
                                }} required />
                            </div>
                            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Basic Salary (₹)</label>
                                    <input type="number" value={payBasic} onChange={e => setPayBasic(e.target.value === '' ? '' : Number(e.target.value))} required />
                                </div>
                                <div className="form-group">
                                    <label>Allowances (₹)</label>
                                    <input type="number" value={payAllowances} onChange={e => setPayAllowances(e.target.value === '' ? '' : Number(e.target.value))} />
                                </div>
                            </div>

                            <h4 style={{ margin: '1rem 0 0.5rem', color: 'var(--error)' }}>Deductions</h4>
                            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Unpaid Leave / Penalties (₹)</label>
                                    <input type="number" value={payLeave} onChange={e => setPayLeave(e.target.value === '' ? '' : Number(e.target.value))} />
                                </div>
                                <div className="form-group">
                                    <label>PF Deduction (₹)</label>
                                    <input type="number" value={payPF} onChange={e => setPayPF(e.target.value === '' ? '' : Number(e.target.value))} />
                                </div>
                                <div className="form-group">
                                    <label>Insurance (₹)</label>
                                    <input type="number" value={payInsurance} onChange={e => setPayInsurance(e.target.value === '' ? '' : Number(e.target.value))} />
                                </div>
                                <div className="form-group">
                                    <label>Tax Bracket (%)</label>
                                    <input type="number" value={payTaxPercent} onChange={e => setPayTaxPercent(e.target.value === '' ? '' : Number(e.target.value))} />
                                </div>
                            </div>

                            <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '8px', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Tax Amount: ₹{currentTax.toLocaleString('en-IN')}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Net Deduction: ₹{currentDeductions.toLocaleString('en-IN')}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Final Disbursement</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{currentNet.toLocaleString('en-IN')}</div>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>Generate & Issue Payslip</button>
                        </form>
                    </div>
                </div>
            )}

                </div>
            </div>
        </div>
    );
}
