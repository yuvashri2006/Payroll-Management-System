const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'employee', enum: ['employee', 'admin'] }
}, { 
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    },
    toObject: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

const employeeSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    position: { type: String },
    salary: { type: Number },
    date_hired: { type: String }, // Storing as YYYY-MM-DD
    is_deleted: { type: Boolean, default: false }
}, { 
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    },
    toObject: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

const payrollSchema = new mongoose.Schema({
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    company_name: { type: String, default: 'Pon Industries' },
    basic_salary: { type: Number, required: true },
    allowances: { type: Number, default: 0 },
    pf_deduction: { type: Number, default: 0 },
    tax_deduction: { type: Number, default: 0 },
    insurance_deduction: { type: Number, default: 0 },
    leave_deduction: { type: Number, default: 0 },
    net_salary: { type: Number, required: true },
    month: { type: String, required: true },
    year: { type: Number, required: true },
    issue_date: { type: String, default: () => new Date().toISOString() },
    status: { type: String, default: 'paid', enum: ['paid', 'pending', 'confirmed', 'rejected'] },
    rejection_reason: { type: String }
}, { 
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    },
    toObject: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

const User = mongoose.model('User', userSchema);
const Employee = mongoose.model('Employee', employeeSchema);
const Payroll = mongoose.model('Payroll', payrollSchema);

module.exports = { User, Employee, Payroll };
