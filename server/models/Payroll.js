const mongoose = require('mongoose');

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

module.exports = mongoose.model('Payroll', payrollSchema);
