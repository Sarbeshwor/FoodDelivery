// ==================================================
// BROWSER CONSOLE SCRIPT TO FIX KITCHEN ID ISSUE
// ==================================================
// 
// INSTRUCTIONS:
// 1. Open your browser console (F12 -> Console tab)
// 2. Copy and paste this entire script
// 3. Press Enter to run it
// 4. Follow the instructions that appear

console.log("🔧 FIXING KITCHEN ID ISSUE...");

// 1. Check current user in localStorage
console.log("📋 Current user in localStorage:");
const currentUser = localStorage.getItem('user');
if (currentUser) {
    const parsed = JSON.parse(currentUser);
    console.log(parsed);
    
    if (!parsed.kitchenId) {
        console.log("❌ PROBLEM: Current user has no kitchenId!");
        console.log("👤 User:", parsed.username);
        console.log("📧 Email:", parsed.email);
        console.log("🏪 Kitchen ID:", parsed.kitchenId || "MISSING");
    } else {
        console.log("✅ User has kitchenId:", parsed.kitchenId);
    }
} else {
    console.log("ℹ️ No user found in localStorage");
}

// 2. Clear localStorage
console.log("\n🗑️ Clearing localStorage...");
localStorage.clear();
console.log("✅ localStorage cleared!");

// 3. Provide login instructions
console.log("\n🔐 LOGIN INSTRUCTIONS:");
console.log("Now you need to log in with a kitchen user:");
console.log("Email: kitchen@kitchen");
console.log("Password: kitchen123");
console.log("\nOR go to your login page and use these credentials");

// 4. Auto-redirect to login if possible
console.log("\n🔄 Attempting to reload page...");
setTimeout(() => {
    window.location.reload();
}, 2000);

console.log("✅ SCRIPT COMPLETED - Page will reload in 2 seconds");
