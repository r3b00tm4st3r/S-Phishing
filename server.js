const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// JSON file path
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

// Ensure data directory and users.json exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

// Helper function to read users from JSON file
function readUsersFromFile() {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
}

// Helper function to write users to JSON file
function writeUsersToFile(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// API endpoint to receive login data
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    console.log('\n========================================');
    console.log('📥 NEW LOGIN REQUEST RECEIVED ON SERVER');
    console.log('========================================');
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 Password: ${password}`);
    console.log(`🕐 Time: ${new Date().toLocaleString()}`);
    console.log('========================================\n');
    
    // Validate input
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required',
            received: { email: email || '', password: password ? '***' : '' }
        });
    }
    
    // Read existing users
    const users = readUsersFromFile();
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    
    let userData;
    if (!existingUser) {
        // New user - add to JSON file
        userData = {
            id: users.length + 1,
            email: email,
            password: password, // Note: In production, hash the password!
            loginCount: 1,
            firstLogin: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            attempts: []
        };
        users.push(userData);
        console.log(`✨ New user created: ${email}`);
    } else {
        // Existing user - update login info
        existingUser.loginCount += 1;
        existingUser.lastLogin = new Date().toISOString();
        if (!existingUser.attempts) existingUser.attempts = [];
        userData = existingUser;
        console.log(`🔄 Existing user logged in: ${email} (Total: ${existingUser.loginCount} times)`);
    }
    
    // Add this login attempt to history
    const attempt = {
        timestamp: new Date().toISOString(),
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
    };
    
    if (!userData.attempts) userData.attempts = [];
    userData.attempts.push(attempt);
    
    // Save to JSON file
    writeUsersToFile(users);
    
    console.log(`💾 Data saved to users.json`);
    console.log(`📊 Total users in database: ${users.length}\n`);
    
    // Send response back to client
    res.json({
        success: true,
        message: existingUser ? 'Welcome back! Login successful' : 'Account created and login successful',
        user: {
            email: email,
            loginCount: userData.loginCount,
            lastLogin: userData.lastLogin
        }
    });
});

// API endpoint to get all users (for debugging/admin)
app.get('/api/users', (req, res) => {
    const users = readUsersFromFile();
    // Remove passwords for security when sending to client
    const safeUsers = users.map(u => ({
        id: u.id,
        email: u.email,
        loginCount: u.loginCount,
        firstLogin: u.firstLogin,
        lastLogin: u.lastLogin,
        attemptsCount: u.attempts ? u.attempts.length : 0
    }));
    res.json({
        totalUsers: users.length,
        users: safeUsers
    });
});

// API endpoint to get specific user data
app.get('/api/user/:email', (req, res) => {
    const users = readUsersFromFile();
    const user = users.find(u => u.email === req.params.email);
    
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Return user data without password
    const safeUser = {
        email: user.email,
        loginCount: user.loginCount,
        firstLogin: user.firstLogin,
        lastLogin: user.lastLogin,
        attempts: user.attempts
    };
    
    res.json({ success: true, user: safeUser });
});

// Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log('\n========================================');
    console.log('🚀 SERVER STARTED SUCCESSFULLY');
    console.log('========================================');
    console.log(`📍 Server running at: http://localhost:${PORT}`);
    console.log(`📁 JSON file location: ${USERS_FILE}`);
    console.log(`🌐 Open browser and visit: http://localhost:${PORT}`);
    console.log('========================================\n');
});
