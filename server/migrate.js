const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/payroll.db');
const db = new sqlite3.Database(dbPath);

const columns = [
    'company_name TEXT',
    'basic_salary DECIMAL(10, 2)',
    'allowances DECIMAL(10, 2)',
    'pf_deduction DECIMAL(10, 2)',
    'tax_deduction DECIMAL(10, 2)',
    'insurance_deduction DECIMAL(10, 2)',
    'leave_deduction DECIMAL(10, 2)',
    'net_salary DECIMAL(10, 2)',
    'month TEXT',
    'year INTEGER',
    'issue_date DATE'
];

db.serialize(() => {
    // Check existing columns to avoid errors on column already exists
    db.all("PRAGMA table_info(payrolls)", (err, rows) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }

        const existingColumns = rows.map(r => r.name);

        columns.forEach(colSpec => {
            const colName = colSpec.split(' ')[0];
            if (!existingColumns.includes(colName)) {
                db.run(`ALTER TABLE payrolls ADD COLUMN ${colSpec}`, (err) => {
                    if (err) console.error(`Error adding ${colName}:`, err.message);
                    else console.log(`Added column: ${colName}`);
                });
            } else {
                console.log(`Column ${colName} already exists.`);
            }
        });

        // Update status default if needed (the previous schema had pending, user wants paid/processed)
        db.run("UPDATE payrolls SET status = 'paid' WHERE status = 'pending'");
    });
});

setTimeout(() => {
    db.close();
    console.log('Migration completed.');
}, 5000);
