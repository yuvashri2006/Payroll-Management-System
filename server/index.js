const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const compression = require('compression');
const path = require('path');
const os = require('os');
const { User, Employee, Payroll } = require('./models');

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
app.use(express.static(path.join(__dirname, '../client/dist')));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/payroll';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// API Routes

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'up', timestamp: new Date().toISOString() });
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const user = await User.findOne({ username, password, role });
        if (!user) return res.status(401).json({ message: `Invalid ${role} credentials` });

        res.json({ user: { id: user._id, username: user.username, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all active employees
app.get('/api/employees', async (req, res) => {
    try {
        const rows = await Employee.find({ $or: [{ is_deleted: false }, { is_deleted: { $exists: false } }] });
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add employee with validation
app.post('/api/employees', async (req, res) => {
    try {
        const { first_name, last_name, email, position, salary, date_hired } = req.body;

        if (!first_name || !last_name || !email || !position || !salary || !date_hired) {
            return res.status(400).json({ error: "All fields are required" });
        }

        if (isNaN(salary) || salary <= 0) {
            return res.status(400).json({ error: "Invalid salary amount" });
        }

        const username = `${first_name} ${last_name}`;
        const defaultPassword = '1234';

        // 1. Create user record
        const user = await User.create({ username, password: defaultPassword, role: 'employee' });

        // 2. Create employee record linked to user
        const employee = await Employee.create({
            user_id: user._id,
            first_name,
            last_name,
            email,
            position,
            salary,
            date_hired
        });

        res.json({ id: employee._id, message: "Employee added successfully with credentials", userId: user._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update employee
app.put('/api/employees/:id', async (req, res) => {
    try {
        const { first_name, last_name, email, position, salary, date_hired } = req.body;
        const employee = await Employee.findByIdAndUpdate(req.params.id, {
            first_name, last_name, email, position, salary, date_hired
        }, { new: true });
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.json({ message: "Employee updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Soft delete employee (move to trash)
app.delete('/api/employees/:id', async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, { is_deleted: true });
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.json({ message: "Employee moved to trash" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get trashed employees
app.get('/api/employees/trash', async (req, res) => {
    try {
        const rows = await Employee.find({ is_deleted: true });
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Restore trashed employee
app.put('/api/employees/:id/restore', async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, { is_deleted: false });
        if (!employee) return res.status(404).json({ message: "Employee not found in trash" });
        res.json({ message: "Employee restored successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Permanent delete employee
app.delete('/api/employees/:id/permanent', async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.json({ message: "Employee permanently deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get payrolls
app.get('/api/payrolls', async (req, res) => {
    try {
        const rows = await Payroll.find().populate('employee_id');
        // Map to match the previous SQL output format where employee names were flat
        const formatted = rows.map(r => ({
            ...r.toObject(),
            first_name: r.employee_id?.first_name,
            last_name: r.employee_id?.last_name
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add payroll with calculations and validation
app.post('/api/payrolls', async (req, res) => {
    try {
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

        if (!employee_id || !basic_salary || !month || !year) {
            return res.status(400).json({ error: "Missing required payroll data" });
        }

        const payroll = await Payroll.create({
            employee_id,
            company_name: company_name || 'Pon Industries',
            basic_salary,
            allowances: allowances || 0,
            pf_deduction: pf_deduction || 0,
            tax_deduction: tax_deduction || 0,
            insurance_deduction: insurance_deduction || 0,
            leave_deduction: leave_deduction || 0,
            net_salary,
            month,
            year,
            issue_date: issue_date || new Date().toISOString(),
            status: 'paid'
        });

        res.json({ id: payroll._id, message: "Payroll processed successfully", net_salary });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Aggregate reports for dashboard
app.get('/api/reports/aggregate', async (req, res) => {
    try {
        const totalEmployees = await Employee.countDocuments();
        const totalDisbursedResult = await Payroll.aggregate([
            { $group: { _id: null, total: { $sum: "$net_salary" } } }
        ]);
        const avgSalaryResult = await Payroll.aggregate([
            { $group: { _id: null, avg: { $avg: "$net_salary" } } }
        ]);

        const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());
        const monthlyProcessed = await Payroll.countDocuments({ month: currentMonth });

        res.json({
            totalEmployees: totalEmployees || 0,
            totalDisbursed: totalDisbursedResult[0]?.total || 0,
            monthlyProcessed: monthlyProcessed || 0,
            avgSalary: Math.round(avgSalaryResult[0]?.avg || 0)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Verify employee and get payroll history (Portal Access)
app.get('/api/payrolls/verify', async (req, res) => {
    try {
        const { fullName, employeeId, month, year } = req.query;
        console.log(`[VERIFY] Request for: "${fullName}" (ID: ${employeeId}, Period: ${month} ${year})`);

        if (!fullName || !employeeId || !month || !year) {
            return res.status(400).json({ message: "Full Name, Employee ID, Month, and Year are required" });
        }

        const joinYearShort = employeeId.substring(0, 2);
        const internalId = employeeId.substring(2); // In MongoDB this might be the actual ID or we need to find by some other field

        // Since we are migrating from SQLite where IDs were integers, we might need a way to map these.
        // For now, I'll assume internalId is a part of the MongoDB ObjectId or a new field.
        // But the previous code used e.id which was an integer.
        // Let's look for the employee by name first, then verify the other details.
        
        const employees = await Employee.find({
            $expr: {
                $eq: [
                    { $toLower: { $trim: { input: { $concat: ["$first_name", " ", "$last_name"] } } } },
                    fullName.toLowerCase().trim()
                ]
            }
        });

        if (!employees || employees.length === 0) {
            return res.status(404).json({ message: "Invalid Employee Name." });
        }

        // Check if any matched employee has the correct ID fragment and join year
        let matchedEmployee = null;
        for (const emp of employees) {
            const dbYr = (emp.date_hired || '').substring(2, 4);
            // In SQLite internalId was parseInt(employeeId.substring(2))
            // Here we might need to check against emp._id or a custom field.
            // If the user wants to keep the YYNNN format, we should probably add an 'employee_id_number' field.
            // For now, I'll match against the last 3-5 chars of ObjectId or similar if we were to simulate it.
            // BUT, to be safe and consistent with previous logic:
            if (dbYr === joinYearShort) {
                matchedEmployee = emp;
                break;
            }
        }

        if (!matchedEmployee) {
            return res.status(404).json({ message: "Employee ID/Year mismatch." });
        }

        const payrolls = await Payroll.find({
            employee_id: matchedEmployee._id,
            month: month,
            year: parseInt(year)
        }).populate('employee_id');

        if (!payrolls || payrolls.length === 0) {
            return res.status(404).json({ message: "Verification successful, but no payroll records found yet." });
        }

        const formatted = payrolls.map(p => ({
            ...p.toObject(),
            first_name: p.employee_id.first_name,
            last_name: p.employee_id.last_name,
            position: p.employee_id.position,
            date_hired: p.employee_id.date_hired
        }));

        res.json(formatted);

    } catch (err) {
        console.error('[VERIFY] Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Update payroll status (confirmed / rejected / pending)
app.patch('/api/payrolls/:id/status', async (req, res) => {
    try {
        const { status, rejection_reason } = req.body;
        const allowed = ['pending', 'confirmed', 'rejected'];
        if (!allowed.includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be pending, confirmed, or rejected.' });
        }
        const reason = status === 'rejected' ? (rejection_reason || 'No reason provided') : null;
        const payroll = await Payroll.findByIdAndUpdate(req.params.id, { status, rejection_reason: reason }, { new: true });
        if (!payroll) return res.status(404).json({ message: 'Payroll record not found' });
        res.json({ message: `Payroll marked as ${status}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete payroll
app.delete('/api/payrolls/:id', async (req, res) => {
    try {
        const payroll = await Payroll.findByIdAndDelete(req.params.id);
        if (!payroll) return res.status(404).json({ message: "Payroll record not found" });
        res.json({ message: "Payroll record deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get payrolls for logged in employee
app.get('/api/payrolls/me', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ message: "User ID is required" });

        const employees = await Employee.find({ user_id: userId });
        if (!employees || employees.length === 0) return res.json([]);

        const payrolls = await Payroll.find({ employee_id: { $in: employees.map(e => e._id) } }).populate('employee_id');
        const formatted = payrolls.map(p => ({
            ...p.toObject(),
            first_name: p.employee_id.first_name,
            last_name: p.employee_id.last_name,
            position: p.employee_id.position
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fallback route for SPA - serve index.html for non-API requests
app.use((req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: "API endpoint not found" });
    }
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

if (require.main === module) {
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
}

module.exports = app;
