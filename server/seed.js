require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./models');

const seedAdmin = async () => {
    try {
        console.log('Connecting to MongoDB for seeding...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to Database.');

        const adminExists = await User.findOne({ username: 'admin' });
        if (adminExists) {
            console.log('Admin user already exists. Updating password...');
            adminExists.password = 'admin123';
            adminExists.role = 'admin';
            await adminExists.save();
        } else {
            console.log('Creating new Admin user...');
            await User.create({
                username: 'admin',
                password: 'admin123',
                role: 'admin'
            });
        }

        console.log('✅ Seeding successful! Account: admin / admin123');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
        process.exit(1);
    }
};

seedAdmin();
