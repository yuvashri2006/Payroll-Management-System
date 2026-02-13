const mysql = require('mysql2/promise');

const passwords = [
    'yuva@2006',
    '',
    'root',
    'password',
    'admin',
    '1234',
    '123456',
    '12345',
    'mysql'
];

async function testConnection() {
    console.log('Testing passwords...');
    for (const pwd of passwords) {
        try {
            const connection = await mysql.createConnection({
                host: '127.0.0.1',
                user: 'root',
                password: pwd
            });
            console.log(`SUCCESS! Password is: '${pwd}'`);
            await connection.end();
            return;
        } catch (err) {
            console.log(`Failed with '${pwd}': ${err.code}`);
        }
    }
    console.log('All passwords failed.');
}

testConnection();
