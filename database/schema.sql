CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'employee', -- SQLite doesn't have ENUM, using TEXT
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    position TEXT,
    salary DECIMAL(10, 2),
    date_hired DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payrolls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER,
    company_name TEXT,
    basic_salary DECIMAL(10, 2),
    allowances DECIMAL(10, 2),
    pf_deduction DECIMAL(10, 2),
    tax_deduction DECIMAL(10, 2),
    insurance_deduction DECIMAL(10, 2),
    leave_deduction DECIMAL(10, 2),
    net_salary DECIMAL(10, 2),
    month TEXT,
    year INTEGER,
    issue_date DATE,
    status TEXT DEFAULT 'paid',
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

