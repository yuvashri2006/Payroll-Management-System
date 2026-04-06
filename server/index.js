const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv');
const compression = require('compression');
const fs = require('fs');
const path = require('path');
const os = require('os');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3030;

app.use(cors());
app.use(compression());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Serve static files from React build directory
app.use(express.static(path.join(__dirname, '../client-react/dist')));

const dbDir = path.join(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('✅ Created database directory');
}

const dbPath = path.join(dbDir, 'payroll.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
        return;
    }
    console.log('✅ Connected to SQLite database');
});

// API Routes

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'up', timestamp: new Date().toISOString() });
});

// Login
app.post('/api/login', (req, res) => {
    const { username, password, role } = req.body;
    const sql = "SELECT * FROM users WHERE username = ? AND password = ? AND role = ?";
    db.get(sql, [username, password, role], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ message: `Invalid ${role} credentials` });

        // In a real app, use JWT. For now, sending user info.
        res.json({ user: { id: user.id, username: user.username, role: user.role } });
    });
});

// Get all active employees
app.get('/api/employees', (req, res) => {
    const sql = "SELECT * FROM employees WHERE is_deleted = 0 OR is_deleted IS NULL";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add employee with validation
app.post('/api/employees', (req, res) => {
    const { first_name, last_name, email, position, salary, date_hired } = req.body;

    // Basic validation
    if (!first_name || !last_name || !email || !position || !salary || !date_hired) {
        return res.status(400).json({ error: "All fields are required" });
    }

    if (isNaN(salary) || salary <= 0) {
        return res.status(400).json({ error: "Invalid salary amount" });
    }

    const username = `${first_name} ${last_name}`;
    const defaultPassword = '1234';

    // 1. Create user record first
    const userSql = "INSERT INTO users (username, password, role) VALUES (?, ?, 'employee')";
    db.run(userSql, [username, defaultPassword], function (err) {
        if (err) {
            return res.status(500).json({ error: "Could not create user credentials: " + err.message });
        }

        const userId = this.lastID;

        // 2. Create employee record linked to user
        const empSql = "INSERT INTO employees (user_id, first_name, last_name, email, position, salary, date_hired) VALUES (?, ?, ?, ?, ?, ?, ?)";
        db.run(empSql, [userId, first_name, last_name, email, position, salary, date_hired], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: "Employee added successfully with credentials", userId });
        });
    });
});

// Update employee
app.put('/api/employees/:id', (req, res) => {
    const { first_name, last_name, email, position, salary, date_hired } = req.body;
    const sql = "UPDATE employees SET first_name = ?, last_name = ?, email = ?, position = ?, salary = ?, date_hired = ? WHERE id = ?";
    db.run(sql, [first_name, last_name, email, position, salary, date_hired, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: "Employee not found" });
        res.json({ message: "Employee updated successfully" });
    });
});

// Soft delete employee (move to trash)
app.delete('/api/employees/:id', (req, res) => {
    const sql = "UPDATE employees SET is_deleted = 1 WHERE id = ?";
    db.run(sql, req.params.id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: "Employee not found" });
        res.json({ message: "Employee moved to trash" });
    });
});

// Get trashed employees
app.get('/api/employees/trash', (req, res) => {
    const sql = "SELECT * FROM employees WHERE is_deleted = 1";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Restore trashed employee
app.put('/api/employees/:id/restore', (req, res) => {
    const sql = "UPDATE employees SET is_deleted = 0 WHERE id = ?";
    db.run(sql, req.params.id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: "Employee not found in trash" });
        res.json({ message: "Employee restored successfully" });
    });
});

// Permanent delete employee
app.delete('/api/employees/:id/permanent', (req, res) => {
    const sql = "DELETE FROM employees WHERE id = ?";
    db.run(sql, req.params.id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: "Employee not found" });
        res.json({ message: "Employee permanently deleted" });
    });
});

// Get payrolls
app.get('/api/payrolls', (req, res) => {
    const sql = `
        SELECT p.*, e.first_name, e.last_name 
        FROM payrolls p 
        JOIN employees e ON p.employee_id = e.id
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add payroll with calculations and validation
app.post('/api/payrolls', (req, res) => {
    const {
        employee_id,
        company_name,
        basic_salary,
        allowances,
        pf_deduction,
        tax_deduction,
        insurance_deduction,
        leave_deduction,
        net_salary,
        month,
        year,
        issue_date
    } = req.body;

    // Validation
    if (!employee_id || !basic_salary || !month || !year) {
        return res.status(400).json({ error: "Missing required payroll data" });
    }

    const sql = `
        INSERT INTO payrolls (
            employee_id, company_name, basic_salary, allowances, 
            pf_deduction, tax_deduction, insurance_deduction, 
            leave_deduction, net_salary, month, year, issue_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid')
    `;

    const params = [
        employee_id, company_name || 'Pon Industries', basic_salary, allowances || 0,
        pf_deduction || 0, tax_deduction || 0, insurance_deduction || 0,
        leave_deduction || 0, net_salary, month, year, issue_date || new Date().toISOString()
    ];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: "Payroll processed successfully", net_salary });
    });
});

// Aggregate reports for dashboard
app.get('/api/reports/aggregate', (req, res) => {
    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM employees) as total_employees,
            (SELECT SUM(net_salary) FROM payrolls) as total_disbursed,
            (SELECT COUNT(*) FROM payrolls WHERE month = ?) as monthly_processed,
            (SELECT AVG(net_salary) FROM payrolls) as avg_salary
    `;

    // Get current month name
    const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());

    db.get(sql, [currentMonth], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
            totalEmployees: row.total_employees || 0,
            totalDisbursed: row.total_disbursed || 0,
            monthlyProcessed: row.monthly_processed || 0,
            avgSalary: Math.round(row.avg_salary || 0)
        });
    });
});

// Verify employee and get payroll history (Portal Access)
app.get('/api/payrolls/verify', (req, res) => {
    const { fullName, employeeId, month, year } = req.query;
    console.log(`[VERIFY] Request for: "${fullName}" (ID: ${employeeId}, Period: ${month} ${year})`);

    if (!fullName || !employeeId || !month || !year) {
        return res.status(400).json({ message: "Full Name, Employee ID, Month, and Year are required" });
    }

    // Parse YYNNN format (e.g., 26001 -> Join Year 2026, Internal ID 1)
    const joinYearShort = employeeId.substring(0, 2);
    const internalId = parseInt(employeeId.substring(2));

    const sql = `
        SELECT p.*, e.first_name, e.last_name, e.position, e.date_hired
        FROM payrolls p 
        JOIN employees e ON p.employee_id = e.id
        WHERE LOWER(TRIM(e.first_name || ' ' || e.last_name)) = LOWER(TRIM(?)) 
        AND e.id = ? 
        AND substr(e.date_hired, 3, 2) = ?
        AND p.month = ?
        AND p.year = ?
    `;

    db.all(sql, [fullName, internalId, joinYearShort, month, parseInt(year)], (err, rows) => {
        if (err) {
            console.error('[VERIFY] DB Error:', err.message);
            return res.status(500).json({ error: err.message });
        }

        console.log(`[VERIFY] Search result for "${fullName}" (ID: ${internalId}, Yr: ${joinYearShort}): Found ${rows ? rows.length : 0} rows`);

        if (!rows || rows.length === 0) {
            // Check if employee exists at all to give better error
            const checkSql = "SELECT first_name, last_name, id, date_hired FROM employees WHERE id = ?";
            db.get(checkSql, [internalId], (err, emp) => {
                if (err) {
                    console.error('[VERIFY] Inner DB Error:', err.message);
                    return res.status(500).json({ error: err.message });
                }

                if (emp) {
                    const dbName = `${emp.first_name} ${emp.last_name}`.toLowerCase().trim();
                    const inputName = fullName.toLowerCase().trim();
                    const dbYr = (emp.date_hired || '').substring(2, 4);

                    console.log(`[VERIFY] Found Employee ${emp.id}: DB Name="${dbName}", Input="${inputName}", DB Yr="${dbYr}", Input="${joinYearShort}"`);

                    if (dbName !== inputName) {
                        return res.status(404).json({ message: "Employee Name does not match our records for this ID." });
                    } else if (dbYr !== joinYearShort) {
                        return res.status(404).json({ message: "Employee ID/Year mismatch." });
                    } else {
                        return res.status(404).json({ message: "Verification successful, but no payroll records found yet." });
                    }
                }
                return res.status(404).json({ message: "Invalid Employee ID." });
            });
        } else {
            res.json(rows);
        }
    });
});

// Update payroll status (confirmed / rejected / pending)
app.patch('/api/payrolls/:id/status', (req, res) => {
    const { status, rejection_reason } = req.body;
    const allowed = ['pending', 'confirmed', 'rejected'];
    if (!allowed.includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be pending, confirmed, or rejected.' });
    }
    const sql = "UPDATE payrolls SET status = ?, rejection_reason = ? WHERE id = ?";
    const reason = status === 'rejected' ? (rejection_reason || 'No reason provided') : null;
    db.run(sql, [status, reason, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Payroll record not found' });
        res.json({ message: `Payroll marked as ${status}` });
    });
});

// Delete payroll
app.delete('/api/payrolls/:id', (req, res) => {
    const sql = "DELETE FROM payrolls WHERE id = ?";
    db.run(sql, req.params.id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: "Payroll record not found" });
        res.json({ message: "Payroll record deleted successfully" });
    });
});

// Get payrolls for logged in employee
app.get('/api/payrolls/me', (req, res) => {
    const { userId } = req.query; // In a real app, this would come from JWT
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const sql = `
        SELECT p.*, e.first_name, e.last_name, e.position
        FROM payrolls p 
        JOIN employees e ON p.employee_id = e.id
        WHERE e.user_id = ?
    `;
    db.all(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Fallback route for SPA - serve index.html for non-API requests
app.use((req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: "API endpoint not found" });
    }
    res.sendFile(path.join(__dirname, '../client-react/dist/index.html'));
});

app.listen(PORT, () => {
    // Get local network IP
    const interfaces = os.networkInterfaces();
    let networkIP = 'localhost';
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                networkIP = alias.address;
                break;
            }
        }
    }

    console.log('\n================================================');
    console.log(`🚀 Server started successfully!`);
    console.log(`🌍 Local access: http://localhost:${PORT}`);
    console.log(`📡 Network access: http://${networkIP}:${PORT}`);
    console.log(`🛠️  API Endpoints: http://${networkIP}:${PORT}/api`);
    console.log('================================================\n');
});
