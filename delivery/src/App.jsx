import React, { useState } from 'react';
import './index.css';
import Navbar from './components/Navbar/Navbar.jsx';
import ProfilePopup from './components/ProfilePopup/ProfilePopup.jsx';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Homepage({ user, onLogout }) {
  const [showProfile, setShowProfile] = useState(false);
  return (
    <div className="delivery-app">
      <Navbar showLinks={true} />
      <div className="profile-btn-container">
        <button className="profile-btn" onClick={() => setShowProfile(true)} title="Profile">
          <span role="img" aria-label="profile" style={{fontSize: '1.7rem'}}>👤</span>
        </button>
      </div>
      <main className="delivery-main">
        <section className="delivery-card">
          <h2 className="delivery-title">Welcome, Delivery Partner!</h2>
          <p style={{ color: '#49557e', fontSize: '1.1rem', marginTop: 12 }}>Select a section from the navigation above to get started.</p>
        </section>
      </main>
      {showProfile && (
        <ProfilePopup user={user} onClose={() => setShowProfile(false)} onLogout={onLogout} />
      )}
    </div>
  );
}

function ApplicationForm({ onClose, onApply }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    vehicle: '',
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/delivery-application', form);
      toast.success('Application submitted!');
      setSubmitted(true);
      onApply(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };
  if (submitted) {
    return (
      <section className="delivery-card">
        <h2 className="delivery-title">Application Submitted!</h2>
        <p style={{ color: '#FBA120', fontWeight: 600, marginTop: 12 }}>Thank you for applying. We will contact you soon.</p>
        <button className="delivery-btn" onClick={onClose} style={{marginTop: 18}}>Back to Login</button>
      </section>
    );
  }
  return (
    <section className="delivery-card">
      <h2 className="delivery-title">Delivery Rider Application</h2>
      <form className="delivery-apply-form" onSubmit={handleSubmit}>
        <input name="name" type="text" placeholder="Full Name" value={form.name} onChange={handleChange} required />
        <input name="phone" type="tel" placeholder="Phone Number" value={form.phone} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} required />
        <select name="vehicle" value={form.vehicle} onChange={handleChange} required>
          <option value="">Select Vehicle Type</option>
          <option value="bike">Bike</option>
          <option value="car">Car</option>
          <option value="bicycle">Bicycle</option>
          <option value="scooter">Scooter</option>
        </select>
        <input name="username" type="text" placeholder="Set Username" value={form.username} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Set Password" value={form.password} onChange={handleChange} required />
        <button className="delivery-btn" type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Application'}</button>
      </form>
      <button className="delivery-btn apply-btn" onClick={onClose} style={{marginTop: 10}} disabled={loading}>Cancel</button>
    </section>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [application, setApplication] = useState(null);
  const [loginFields, setLoginFields] = useState({ username: '', password: '' });

  const handleLogin = () => {
    if (!loginFields.username && !loginFields.password) {
      toast.error('Please enter username and password');
      return;
    }
    if (!loginFields.username) {
      toast.error('Please enter username');
      return;
    }
    if (!loginFields.password) {
      toast.error('Please enter password');
      return;
    }
    if (!application) {
      toast.error('No application found. Please apply first.');
      return;
    }
    if (loginFields.username !== application.username && loginFields.password !== application.password) {
      toast.error('Both username and password are incorrect');
      return;
    }
    if (loginFields.username !== application.username) {
      toast.error('Username is incorrect');
      return;
    }
    if (loginFields.password !== application.password) {
      toast.error('Password is incorrect');
      return;
    }
    toast.success('Login successful!');
    setTimeout(() => setLoggedIn(true), 800);
  };

  const handleLoginFieldChange = (e) => {
    setLoginFields({ ...loginFields, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setLoginFields({ username: '', password: '' });
    toast.success('Logged out successfully!');
  };

  if (loggedIn) {
    return <Homepage user={application} onLogout={handleLogout} />;
  }

  return (
    <div className="delivery-app">
      <ToastContainer position="top-center" autoClose={2000} />
      <Navbar />
      <main className="delivery-main">
        {showApply ? (
          <ApplicationForm onClose={() => setShowApply(false)} onApply={setApplication} />
        ) : (
          <section className="login-section delivery-card">
            <h2 className="delivery-title">Delivery Login</h2>
            <div className="delivery-inputs">
              <input name="username" type="text" placeholder="Username" value={loginFields.username} onChange={handleLoginFieldChange} />
              <input name="password" type="password" placeholder="Password" value={loginFields.password} onChange={handleLoginFieldChange} />
              <button className="delivery-btn" onClick={handleLogin}>Login</button>
              <button className="delivery-btn apply-btn" onClick={() => setShowApply(true)}>Apply</button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App; 