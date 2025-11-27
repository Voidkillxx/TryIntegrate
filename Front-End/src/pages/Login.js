import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, resendOtp } from "../utils/api"; // Import resendOtp
import OtpPage from "./OtpPage"; // Import new component
import "../Styles/Login.css"; 

function Login({ handleLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [step, setStep] = useState('login'); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { alert("Please fill in all fields."); return; }
    setLoading(true);
    try {
        const response = await loginUser({ login_id: email, password });
        if (response.require_otp) {
            // Set email from response to ensure we have the right one (if username was used)
            if(response.email) setEmail(response.email);
            setStep('otp');
        }
    } catch (error) {
        alert(error.message || "Login failed");
    } finally {
        setLoading(false);
    }
  };

  // If step is OTP, show the new component
  if (step === 'otp') {
      return (
          <OtpPage 
            email={email}
            context="login"
            onSuccess={(data) => handleLogin(data.token, data.user)}
            onResend={async () => await resendOtp({ email })}
            onBack={() => setStep('login')}
          />
      );
  }

  // Normal Login View
  return (
    <div className="login-container">
      <div className="login-card">
        <button className="back-btn" onClick={() => navigate("/")}>← Back</button>
        <div className="logo-container"><img src="/img/logo.png" alt="Logo" className="logo" /></div>
        <h2 className="store-name">JAKE STORE</h2>
        <h3 className="subtitle">Welcome Back!</h3>
        <p>Login to your account</p>

        <form onSubmit={handleSubmit}>
            <label className="form-label">Email or Username</label>
            <input type="text" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
            
            <label className="form-label">Password</label>
            <div className="password-container">
            <input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
            <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button>
            </div>

            <button type="submit" className="btn" disabled={loading}>{loading ? "Checking..." : "Login"}</button>

            <div className="bottom-text">
                <Link to="/forgot">Forgot Password?</Link><br />
                Don’t have an account? <Link to="/register">Register</Link>
            </div>
        </form>
      </div>
    </div>
  );
}
export default Login;