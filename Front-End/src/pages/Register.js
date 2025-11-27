import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, resendOtp } from "../utils/api";
import { Spinner } from "react-bootstrap";
import OtpPage from "./OtpPage"; // Import new component
import "../Styles/Register.css";

// ... (Keep your existing LoadingModal and StatusModal for the Register form itself) ...
const LoadingModal = () => (
  <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex justify-content-center align-items-center" style={{zIndex: 2000}}>
    <div className="bg-white p-4 rounded shadow text-center">
      <Spinner animation="border" variant="primary" className="mb-3" style={{width: '3rem', height: '3rem'}} />
      <h5 className="mb-0 text-dark fw-bold">Creating Account...</h5>
    </div>
  </div>
);

function Register({ onLogin }) {
  const [view, setView] = useState('register'); // 'register' | 'otp'
  const [formData, setFormData] = useState({
    username: "", first_name: "", last_name: "", email: "", 
    phone_number: "", address: "", zipcode: "", 
    password: "", password_confirmation: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) { alert("Passwords do not match."); return; }
    
    setLoading(true);
    try {
      const response = await registerUser(formData);
      // If success, switch to OTP view
      setView('otp');
    } catch (err) {
      alert(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  // Render OTP Page if view is 'otp'
  if (view === 'otp') {
      return (
          <OtpPage 
             email={formData.email}
             context="register"
             // On Success, log them in using the handler from App.js
             onSuccess={(data) => {
                 if(onLogin) onLogin(data.token, data.user);
                 else navigate('/login');
             }}
             onResend={async () => await resendOtp({ email: formData.email })}
             onBack={() => setView('register')}
          />
      );
  }

  // Render Register Form (Simplified for brevity, keeping your exact layout logic)
  return (
    <div className="register-container">
      {loading && <LoadingModal />}
      <div className="register-card pb-4" style={{maxWidth: '900px', width: '95%', padding: '2rem'}}>
        <div className="d-flex justify-content-between align-items-center mb-4">
             <button className="back-btn mb-0" onClick={() => navigate("/login")}>&larr; Back to Login</button>
             <div className="text-end">
                 <h2 className="store-name m-0" style={{fontSize: '1.5rem'}}>JAKE STORE</h2>
                 <h3 className="subtitle m-0" style={{fontSize: '1rem'}}>Create Account</h3>
             </div>
        </div>

        <form onSubmit={handleRegister}>
          <div className="row g-3">
            <div className="col-md-6">
                <label className="form-label small fw-bold">First Name</label>
                <input type="text" name="first_name" className="form-control" value={formData.first_name} onChange={handleChange} required disabled={loading} />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold">Last Name</label>
                <input type="text" name="last_name" className="form-control" value={formData.last_name} onChange={handleChange} required disabled={loading} />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold">Username</label>
                <input type="text" name="username" className="form-control" value={formData.username} onChange={handleChange} required disabled={loading} />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold">Email Address</label>
                <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required disabled={loading} />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold">Phone Number</label>
                <input type="text" name="phone_number" className="form-control" value={formData.phone_number} onChange={handleChange} required disabled={loading} />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold">Zipcode</label>
                <input type="text" name="zipcode" className="form-control" value={formData.zipcode} onChange={handleChange} required disabled={loading} />
            </div>
            <div className="col-12">
                <label className="form-label small fw-bold">Address</label>
                <input type="text" name="address" className="form-control" value={formData.address} onChange={handleChange} required disabled={loading} />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold">Password</label>
                <div className="password-container input-group">
                    <input type={showPassword ? "text" : "password"} name="password" className="form-control" value={formData.password} onChange={handleChange} required disabled={loading} style={{borderRight: 'none'}} />
                    <button className="btn btn-outline-secondary border-start-0" type="button" onClick={() => setShowPassword(!showPassword)} style={{zIndex: 0}}>{showPassword ? "Hide" : "Show"}</button>
                </div>
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold">Confirm</label>
                <div className="password-container input-group">
                    <input type={showConfirm ? "text" : "password"} name="password_confirmation" className="form-control" value={formData.password_confirmation} onChange={handleChange} required disabled={loading} style={{borderRight: 'none'}} />
                    <button className="btn btn-outline-secondary border-start-0" type="button" onClick={() => setShowConfirm(!showConfirm)} style={{zIndex: 0}}>{showConfirm ? "Hide" : "Show"}</button>
                </div>
            </div>
          </div>

          <button type="submit" className="btn mt-5 w-100" disabled={loading}>
            {loading ? "Processing..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;