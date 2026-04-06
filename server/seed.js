require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./models');

const seedData = async () => {
    try {
        console.log('Connecting to MongoDB for seeding...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to Database.');

        // 1. Seed Admin
        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            console.log('Creating Admin user...');
            await User.create({ username: 'admin', password: 'admin123', role: 'admin' });
        }

        // 2. Seed Employees
        const { Employee } = require('./models');
        const count = await Employee.countDocuments();
        if (count < 10) {
            console.log(`Currently ${count} employees. Adding more to reach at least 10...`);
            const employeesToSeed = [
                { first_name: 'Aditi', last_name: 'Sharma', email: 'aditi@sharma.com', position: 'Software Engineer', salary: 850000, date_hired: '2023-01-15' },
                { first_name: 'Rahul', last_name: 'Verma', email: 'rahul@verma.com', position: 'Product Manager', salary: 1200000, date_hired: '2022-05-20' },
                { first_name: 'Priya', last_name: 'Patel', email: 'priya@patel.com', position: 'UI/UX Designer', salary: 750000, date_hired: '2023-03-10' },
                { first_name: 'Amit', last_name: 'Singh', email: 'amit@singh.com', position: 'Data Scientist', salary: 1500000, date_hired: '2021-11-02' },
                { first_name: 'Sneha', last_name: 'Reddy', email: 'sneha@reddy.com', position: 'HR Manager', salary: 650000, date_hired: '2023-08-12' },
                { first_name: 'Vikram', last_name: 'Gupta', email: 'vikram@gupta.com', position: 'DevOps Engineer', salary: 1100000, date_hired: '2022-09-25' },
                { first_name: 'Anjali', last_name: 'Nair', email: 'anjali@nair.com', position: 'Marketing Analyst', salary: 550000, date_hired: '2024-01-08' },
                { first_name: 'Manish', last_name: 'Pandey', email: 'manish@pandey.com', position: 'Backend Developer', salary: 950000, date_hired: '2022-12-30' },
                { first_name: 'Deepa', last_name: 'Das', email: 'deepa@das.com', position: 'Quality Assurance', salary: 600000, date_hired: '2023-06-15' },
                { first_name: 'Suresh', last_name: 'Rao', email: 'suresh@rao.com', position: 'Finance Specialist', salary: 800000, date_hired: '2022-02-28' }
            ];

            for (const emp of employeesToSeed) {
                const exists = await Employee.findOne({ email: emp.email });
                if (!exists) {
                    await Employee.create(emp);
                    console.log(`Seeded: ${emp.first_name} ${emp.last_name}`);
                }
            }
        }

        console.log('✅ Seeding successful!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
        process.exit(1);
    }
};

seedData();
