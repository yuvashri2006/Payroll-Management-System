const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/payroll.db');
const db = new sqlite3.Database(dbPath);

console.log('Running automated data verification for 20-record realistic dataset...');

db.serialize(() => {
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (err) console.error(err);
        else console.log(`Users count: ${row.count} (Expected: 21)`); // 1 admin + 20 employees
    });

    db.get("SELECT COUNT(*) as count FROM employees", (err, row) => {
        if (err) console.error(err);
        else console.log(`Employees count: ${row.count} (Expected: 20)`);
    });

    db.get("SELECT COUNT(*) as count FROM payrolls", (err, row) => {
        if (err) console.error(err);
        else console.log(`Payrolls count: ${row.count} (Expected: 20)`);
    });

    console.log('\n--- Sample Data ---');
    db.each("SELECT first_name, last_name, position FROM employees LIMIT 5", (err, row) => {
        if (err) console.error(err);
        else console.log(`Employee: ${row.first_name} ${row.last_name} - ${row.position}`);
    });
});

db.close();
