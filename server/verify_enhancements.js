const http = require('http');

const API_BASE = 'http://localhost:3030/api';

function request(url, options = {}) {
    return new Promise((resolve, reject) => {
        const fullUrl = new URL(url);
        const reqOptions = {
            hostname: fullUrl.hostname,
            port: fullUrl.port,
            path: fullUrl.pathname + fullUrl.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        const req = http.request(reqOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        json: () => Promise.resolve(JSON.parse(data))
                    });
                } catch (e) {
                    resolve({ status: res.statusCode, text: () => Promise.resolve(data) });
                }
            });
        });

        req.on('error', reject);
        if (options.body) req.write(options.body);
        req.end();
    });
}

async function verify() {
    console.log('--- Starting API Verification ---');

    try {
        // 1. Test Login
        console.log('\n1. Testing Login...');
        const loginRes = await request(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'password123', role: 'admin' })
        });

        if (loginRes.status !== 200) {
            console.log('Login failed (server might not be running)');
            return;
        }

        const loginData = await loginRes.json();
        console.log('Login successful:', loginData.user.username);

        // 2. Test Get Employees
        console.log('\n2. Testing Get Employees...');
        const empRes = await request(`${API_BASE}/employees`);
        const employees = await empRes.json();
        console.log('Total employees found:', employees.length);
        const testEmp = employees[0];

        if (testEmp) {
            // 3. Test Update Employee
            console.log(`\n3. Testing Update Employee (ID: ${testEmp.id})...`);
            const updateRes = await request(`${API_BASE}/employees/${testEmp.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: testEmp.first_name,
                    last_name: testEmp.last_name,
                    email: testEmp.email,
                    position: testEmp.position + ' (Updated)',
                    salary: testEmp.salary,
                    date_hired: testEmp.date_hired
                })
            });
            const updateData = await updateRes.json();
            console.log('Update result:', updateData.message);

            // 4. Test Get My Payrolls
            console.log(`\n4. Testing Get My Payrolls (User ID: ${testEmp.user_id || 1})...`);
            const myPayRes = await request(`${API_BASE}/payrolls/me?userId=${testEmp.user_id || 1}`);
            const myPayrolls = await myPayRes.json();
            console.log('My payrolls found:', Array.isArray(myPayrolls) ? myPayrolls.length : 'Error');
        }

        console.log('\n--- Verification Completed Successfully ---');
    } catch (error) {
        console.error('\nVerification failed:', error.message);
        console.log('Hint: Make sure the server is running on port 3001.');
    }
}

verify();
