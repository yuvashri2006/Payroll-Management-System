const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('../database/payroll.db');
db.all('SELECT * FROM users', (err, rows) => {
    console.log(JSON.stringify(rows, null, 2));
});
