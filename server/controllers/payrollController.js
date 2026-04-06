const { Payroll, Employee } = require('../models');

exports.getPayrolls = async (req, res) => {
    try {
        const rows = await Payroll.find().populate('employee_id');
        const formatted = rows.map(r => ({
            ...r.toObject(),
            first_name: r.employee_id?.first_name,
            last_name: r.employee_id?.last_name
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addPayroll = async (req, res) => {
    try {
        const payroll = await Payroll.create(req.body);
        res.json({ id: payroll._id, message: "Payroll processed successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status, rejection_reason } = req.body;
        const payroll = await Payroll.findByIdAndUpdate(req.params.id, { 
            status, 
            rejection_reason: status === 'rejected' ? rejection_reason : null 
        }, { new: true });
        if (!payroll) return res.status(404).json({ message: 'Payroll record not found' });
        res.json({ message: `Payroll marked as ${status}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deletePayroll = async (req, res) => {
    try {
        const payroll = await Payroll.findByIdAndDelete(req.params.id);
        if (!payroll) return res.status(404).json({ message: "Payroll record not found" });
        res.json({ message: "Payroll record deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMyPayrolls = async (req, res) => {
    try {
        const { userId } = req.query;
        const employees = await Employee.find({ user_id: userId });
        const payrolls = await Payroll.find({ employee_id: { $in: employees.map(e => e._id) } }).populate('employee_id');
        const formatted = payrolls.map(p => ({
            ...p.toObject(),
            first_name: p.employee_id?.first_name,
            last_name: p.employee_id?.last_name,
            position: p.employee_id?.position
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.verifyPayroll = async (req, res) => {
    try {
        const { fullName, employeeId, month, year } = req.query;
        const employees = await Employee.find({
            $expr: {
                $eq: [
                    { $toLower: { $trim: { input: { $concat: ["$first_name", " ", "$last_name"] } } } },
                    fullName.toLowerCase().trim()
                ]
            }
        });

        if (!employees.length) return res.status(404).json({ message: "Invalid Employee Name." });

        const joinYearShort = employeeId.substring(0, 2);
        const matchedEmployee = employees.find(emp => (emp.date_hired || '').substring(2, 4) === joinYearShort);

        if (!matchedEmployee) return res.status(404).json({ message: "Employee ID/Year mismatch." });

        const payrolls = await Payroll.find({
            employee_id: matchedEmployee._id, month, year: parseInt(year)
        }).populate('employee_id');

        if (!payrolls.length) return res.status(404).json({ message: "No payroll records found for this period." });

        const formatted = payrolls.map(p => ({
            ...p.toObject(),
            first_name: p.employee_id.first_name,
            last_name: p.employee_id.last_name,
            position: p.employee_id.position,
            date_hired: p.employee_id.date_hired
        }));

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAggregateReports = async (req, res) => {
    try {
        const totalEmployees = await Employee.countDocuments();
        const totalDisbursed = await Payroll.aggregate([{ $group: { _id: null, total: { $sum: "$net_salary" } } }]);
        const avgSalary = await Payroll.aggregate([{ $group: { _id: null, avg: { $avg: "$net_salary" } } }]);
        const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());
        const monthlyProcessed = await Payroll.countDocuments({ month: currentMonth });

        res.json({
            totalEmployees,
            totalDisbursed: totalDisbursed[0]?.total || 0,
            monthlyProcessed,
            avgSalary: Math.round(avgSalary[0]?.avg || 0)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
