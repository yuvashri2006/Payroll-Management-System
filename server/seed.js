const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/payroll.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to the SQLite database.');
});

const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const positions = ['Software Engineer', 'Senior Developer', 'Product Manager', 'HR Specialist', 'Accountant', 'Sales Representative', 'Customer Support', 'Marketing Manager', 'UI/UX Designer', 'Data Analyst', 'QA Engineer', 'DevOps Engineer', 'Business Analyst', 'Project Manager', 'Office Manager', 'Recruiter', 'Content Writer', 'Legal Advisor', 'Operations Manager', 'Consultant'];

const users = [
    ['admin', 'admin123', 'admin'] // ID 1
];

const employees = [];
const payrolls = [];

// Generate 20 employees
for (let i = 0; i < 20; i++) {
    const firstName = firstNames[i];
    const lastName = lastNames[i];
    const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    const position = positions[i]; // Unique position for each if we have 20

    // User IDs start from 2 (since admin is 1)
    users.push([username, 'pass123', 'employee']);

    employees.push([
        i + 2, // user_id
        firstName, // first_name
        lastName, // last_name
        email, // email
        position, // position
        50000 + (i * 1500), // salary
        '2023-01-15' // date_hired
    ]);

    // Employee IDs will be 1 to 20
    payrolls.push([
        i + 1, // employee_id
        (50000 + (i * 1500)) / 12, // salary
        '2023-05-30', // pay_date
        'paid' // status
    ]);
}

db.serialize(() => {
    // 1. Clear tables and reset sequences
    db.run("DELETE FROM users");
    db.run("DELETE FROM employees");
    db.run("DELETE FROM payrolls");
    db.run("DELETE FROM sqlite_sequence"); // Resets autoincrement IDs

    // 2. Insert Users
    const userStmt = db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
    users.forEach(user => {
        userStmt.run(user);
    });
    userStmt.finalize();
    console.log(`Inserted ${users.length} users`);

    // 3. Insert Employees
    const empStmt = db.prepare("INSERT INTO employees (user_id, first_name, last_name, email, position, salary, date_hired) VALUES (?, ?, ?, ?, ?, ?, ?)");
    employees.forEach(emp => {
        empStmt.run(emp);
    });
    empStmt.finalize();
    console.log(`Inserted ${employees.length} employees`);

    // 4. Insert Payrolls
    const payrollStmt = db.prepare("INSERT INTO payrolls (employee_id, salary, pay_date, status) VALUES (?, ?, ?, ?)");
    payrolls.forEach(payroll => {
        payrollStmt.run(payroll);
    });
    payrollStmt.finalize();
    console.log(`Inserted ${payrolls.length} payroll records`);

    console.log('Seeding completed.');
});

db.close();
