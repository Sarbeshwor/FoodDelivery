// Delivery App Logout Handler
// This script handles cross-app logout messages from the frontend

const handleCrossAppLogout = () => {
  // Clear all localStorage data
  localStorage.clear();
  
  // Clear sessionStorage as well
  sessionStorage.clear();
  
  // Show notification and reload
  alert('You have been logged out from the main app');
  
  // Reload the page to reset the app state
  window.location.reload();
  
  console.log('🚚 Delivery app: Auto-logout triggered from frontend');
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

// Check if user data exists on page load for protected routes
window.addEventListener('load', () => {
  const user = localStorage.getItem('user');
  
  // Add your delivery app authentication logic here
  if (!user) {
    console.log('🚚 Delivery app: No user data found');
    // You can add redirect logic or show login form here
  }
});

console.log('🚚 Delivery logout handler initialized');
