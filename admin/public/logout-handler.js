// Admin App Logout Handler
// This script handles cross-app logout messages from the frontend

const handleCrossAppLogout = () => {
  // Clear all localStorage data
  localStorage.clear();
  
  // Clear sessionStorage as well
  sessionStorage.clear();
  
  // Show notification
  alert('You have been logged out from the main app');
  
  // Redirect to access denied page for better UX
  window.location.href = '/access-denied.html';
  
  console.log('🔐 Admin app: Auto-logout triggered from frontend');
};

// Listen for localStorage changes (works across tabs/windows on same origin)
window.addEventListener('storage', (event) => {
  // If the user key was removed from localStorage, trigger logout
  if (event.key === 'user' && event.newValue === null) {
    handleCrossAppLogout();
  }
  
  // Also listen for a specific logout signal
  if (event.key === 'logout_signal' && event.newValue === 'true') {
    localStorage.removeItem('logout_signal'); // Clean up
    handleCrossAppLogout();
  }
});

// Listen for messages from frontend app
window.addEventListener('message', (event) => {
  // Only accept messages from trusted origins
  const trustedOrigins = ['http://localhost:5174', 'http://localhost:3000'];
  
  if (trustedOrigins.includes(event.origin) && event.data.type === 'LOGOUT_CLEAR_STORAGE') {
    handleCrossAppLogout();
  }
});

// Listen for BroadcastChannel messages
if (typeof BroadcastChannel !== 'undefined') {
  const logoutChannel = new BroadcastChannel('logout_channel');
  
  logoutChannel.addEventListener('message', (event) => {
    if (event.data.type === 'LOGOUT_CLEAR_STORAGE') {
      handleCrossAppLogout();
    }
  });
}

// Check if user data exists on page load, if not redirect to login
window.addEventListener('load', () => {
  const user = localStorage.getItem('user');
  
  // Only check for auth on non-login and non-access-denied pages
  if (!window.location.pathname.includes('login.html') && 
      !window.location.pathname.includes('access-denied.html') && 
      !user) {
    console.log('🔐 Admin app: No user data found, redirecting to access denied');
    window.location.href = '/access-denied.html';
  }
});

console.log('🔐 Admin logout handler initialized');
