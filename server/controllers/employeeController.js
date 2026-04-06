const { Employee, User } = require('../models');

exports.getEmployees = async (req, res) => {
    try {
        const rows = await Employee.find({ $or: [{ is_deleted: false }, { is_deleted: { $exists: false } }] });
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addEmployee = async (req, res) => {
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

        const user = await User.create({ username, password: defaultPassword, role: 'employee' });
        const employee = await Employee.create({
            user_id: user._id,
            first_name, last_name, email, position, salary, date_hired
        });

        res.json({ id: employee._id, message: "Employee added successfully", userId: user._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.json({ message: "Employee updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, { is_deleted: true });
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.json({ message: "Employee moved to trash" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTrash = async (req, res) => {
    try {
        const rows = await Employee.find({ is_deleted: true });
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.restoreEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, { is_deleted: false });
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.json({ message: "Employee restored successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.permanentDelete = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.json({ message: "Employee permanently deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
