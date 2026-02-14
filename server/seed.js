const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/payroll.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Add an employee user for testing
    // Note: In production you'd use hashed passwords
    db.run("INSERT OR IGNORE INTO users (username, password, role) VALUES ('emp1', 'emp123', 'employee')", (err) => {
        if (err) console.error(err);
        else console.log('TestData: Employee user created (emp1/emp123)');
    });

    // Link a user to an employee if possible
    db.all("SELECT id FROM employees LIMIT 1", (err, rows) => {
        if (rows && rows.length > 0) {
            const empId = rows[0].id;
            db.run("UPDATE employees SET user_id = (SELECT id FROM users WHERE username = 'emp1') WHERE id = ?", [empId]);
        }
    });
});

setTimeout(() => {
    db.close();
    console.log('Seeding completed.');
}, 2000);
