async function verify() {
    try {
        console.log('Testing Login...');
        const loginRes = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText}`);
        const loginData = await loginRes.json();
        console.log('Login Success:', loginData);

        console.log('Testing Get Employees...');
        const empRes = await fetch('http://localhost:3001/api/employees');
        if (!empRes.ok) throw new Error(`Get Employees failed: ${empRes.statusText}`);
        const empData = await empRes.json();
        console.log('Employees:', empData);

        console.log('Verification Passed!');
    } catch (err) {
        console.error('Verification Failed:', err.message);
    }
}

verify();
