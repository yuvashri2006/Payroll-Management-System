const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client')));

// Database connection
const dbPath = path.join(__dirname, '../database/payroll.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
        return;
    }
    console.log('Connected to SQLite database');
});

// API Routes

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

// Get all employees
app.get('/api/employees', (req, res) => {
    const sql = "SELECT * FROM employees";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add employee (automatically creates user credentials)
app.post('/api/employees', (req, res) => {
    const { first_name, last_name, email, position, salary, date_hired } = req.body;
    const username = `${first_name} ${last_name}`;
    const defaultPassword = 'payroll123';

    // 1. Create user record first
    const userSql = "INSERT INTO users (username, password, role) VALUES (?, ?, 'employee')";
    db.run(userSql, [username, defaultPassword], function (err) {
        if (err) {
            // If username exists (collision), we could handle it, but for now error out
            return res.status(500).json({ error: "Could not create user credentials: " + err.message });
        }

        const userId = this.lastID;

        // 2. Create employee record linked to user
        const empSql = "INSERT INTO employees (user_id, first_name, last_name, email, position, salary, date_hired) VALUES (?, ?, ?, ?, ?, ?, ?)";
        db.run(empSql, [userId, first_name, last_name, email, position, salary, date_hired], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: "Employee added successfully with credentials" });
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

// Delete employee
app.delete('/api/employees/:id', (req, res) => {
    const sql = "DELETE FROM employees WHERE id = ?";
    db.run(sql, req.params.id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: "Employee not found" });
        res.json({ message: "Employee deleted successfully" });
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

// Add payroll with calculations
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

    const sql = `
        INSERT INTO payrolls (
            employee_id, company_name, basic_salary, allowances, 
            pf_deduction, tax_deduction, insurance_deduction, 
            leave_deduction, net_salary, month, year, issue_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid')
    `;

    const params = [
        employee_id, company_name, basic_salary, allowances,
        pf_deduction, tax_deduction, insurance_deduction,
        leave_deduction, net_salary, month, year, issue_date
    ];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: "Payroll processed successfully", net_salary });
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

// Catch-all route to serve index.html for client-side routing
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
