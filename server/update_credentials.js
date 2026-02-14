const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/payroll.db');
const db = new sqlite3.Database(dbPath);

console.log('Starting credential update...');

db.serialize(() => {
    // 1. Get all employees who don't have a user_id or whose user_id doesn't exist
    db.all("SELECT * FROM employees", [], (err, employees) => {
        if (err) {
            console.error(err);
            return;
        }

        employees.forEach(emp => {
            const username = `${emp.first_name} ${emp.last_name}`;
            const password = 'payroll123';

            // Check if user already exists
            db.get("SELECT id FROM users WHERE username = ?", [username], (err, user) => {
                if (err) return console.error(err);

                if (user) {
                    // Update employee to link to this existing user if not already
                    db.run("UPDATE employees SET user_id = ? WHERE id = ?", [user.id, emp.id]);
                    console.log(`Linked existing user ${username} to employee ID ${emp.id}`);
                } else {
                    // Create new user
                    db.run("INSERT INTO users (username, password, role) VALUES (?, ?, 'employee')", [username, password], function (err) {
                        if (err) {
                            console.error(`Error creating user for ${username}:`, err.message);
                        } else {
                            const newUserId = this.lastID;
                            db.run("UPDATE employees SET user_id = ? WHERE id = ?", [newUserId, emp.id]);
                            console.log(`Created new credentials for ${username}`);
                        }
                    });
                }
            });
        });
    });
});
