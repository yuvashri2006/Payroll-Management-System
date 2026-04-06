# Sharing the Payroll Management System

To allow others to access the Payroll Management System, you have two primary options depending on whether they are in the same network or accessing it via the internet.

## Option 1: Sharing on your Local Network (Office/Home)

This is the simplest way if everyone is connected to the same Wi-Fi or local network.

1.  **Get your Network URL**:
    When you start the server, look for the **📡 Network access** URL in the console.
    It should look like this: `http://10.10.176.86:3030`

2.  **Share the Link**:
    Copy that link and send it to your colleagues. As long as they are on the same network, they can open it in their browser.

---

## Option 3: "Employee Only" Restricted Link

If you want others to access **only the employee portal** without seeing the Administrator options:

1.  **Restricted Login Link**:
    `http://10.10.176.86:3030/?role=employee`
    This link hides the "Administrator" tab and defaults to the Employee login.

2.  **Direct Portal Link**:
    `http://10.10.176.86:3030/employee-portal`
    This goes directly to the verification page where they can enter their Name and ID to see their payslips.

---

If you need to share the link with someone outside your network, you can use a tunnel service like **ngrok**.

### Setup Instructions for ngrok:

1.  **Download ngrok**:
    Go to [ngrok.com](https://ngrok.com/download) and download the version for Windows.

2.  **Install & Authenticate**:
    Unzip the file and follow the instructions on your ngrok dashboard to add your auth token.

3.  **Start the Tunnel**:
    Open a terminal and run:
    ```bash
    ngrok http 3030
    ```

4.  **Copy the Public URL**:
    ngrok will provide a "Forwarding" link (e.g., `https://random-id.ngrok-free.app`). Send **this** link to anyone you want!

---

> [!IMPORTANT]
> Your server must be running (`node index.js`) for either of these links to work. If you close the terminal or stop the server, the links will stop working.
