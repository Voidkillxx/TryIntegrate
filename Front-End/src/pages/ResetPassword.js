import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { checkOtpPublic, resetPassword, forgotPassword } from "../utils/api";
import { Spinner } from "react-bootstrap";
import "../Styles/ResetPassword.css"; // Ensure this file exists, or reuse Register.css styles

// --- MODAL COMPONENTS (Reused for consistency) ---
const LoadingModal = ({ text }) => (
  <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex justify-content-center align-items-center" style={{zIndex: 2000}}>
    <div className="bg-white p-4 rounded shadow text-center">
      <Spinner animation="border" variant="primary" className="mb-3" style={{width: '3rem', height: '3rem'}} />
      <h5 className="mb-0 text-dark fw-bold">{text || "Processing..."}</h5>
      <small className="text-muted">Please wait</small>
    </div>
  </div>
);

const StatusModal = ({ type, message, onClose }) => (
  <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center" style={{zIndex: 2050}}>
    <div className={`bg-white p-4 rounded shadow text-center ${type === 'error' ? 'border-danger' : 'border-success'}`} style={{maxWidth: '350px', width: '90%', borderTop: '5px solid'}}>
      <div className="mb-3 display-4">
        <i className={`bi ${type === 'error' ? 'bi-x-circle text-danger' : 'bi-check-circle text-success'}`}></i>
      </div>
      <h5 className="fw-bold mb-3">{type === 'error' ? 'Error' : 'Success!'}</h5>
      <p className="text-muted mb-4">{message}</p>
      <button className={`btn ${type === 'error' ? 'btn-danger' : 'btn-success'} w-100`} onClick={onClose}>OK</button>
    </div>
  </div>
);

function ResetPassword() {
  // --- STATE ---
  const [view, setView] = useState('otp'); // 'otp' | 'password'
  
  const [otp, setOtp] = useState("");
  const [verifiedOtp, setVerifiedOtp] = useState(""); // Store OTP after verification
  
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  const [resendTimer, setResendTimer] = useState(0);
  
  const navigate = useNavigate();
  const resetEmail = localStorage.getItem("resetEmail");

  // --- EFFECTS ---
  useEffect(() => {
    if (!resetEmail) {
      // If no email in storage, they shouldn't be here
      setError("No email found. Please start the process again.");
      setTimeout(() => navigate("/forgot"), 2000);
    }
  }, [resetEmail, navigate]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // --- HANDLERS ---

  const closeStatus = () => {
    if (message.includes("successfully")) {
        navigate("/login");
    }
    setMessage('');
    setError('');
  };

  // STEP 1: Verify OTP Only
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
        setError("Please enter a valid 6-digit code.");
        return;
    }

    setLoading(true);
    try {
        // Use the Public Check Endpoint (Does not login, just validates)
        await checkOtpPublic({ email: resetEmail, code: otp });
        
        // If success:
        setVerifiedOtp(otp); // Save OTP for the next step
        setView('password'); // Switch to Password View
    } catch (err) {
        setError(err.message || "Invalid verification code.");
    } finally {
        setLoading(false);
    }
  };

  // STEP 2: Reset Password (sends Email + VerifiedOTP + NewPassword)
  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    if (newPass.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPass !== confirmPass) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ 
          email: resetEmail, 
          code: verifiedOtp, // Use the OTP we verified in Step 1
          password: newPass 
      });
      
      setMessage("Password updated successfully! You can now log in.");
      localStorage.removeItem("resetEmail"); // Cleanup
    } catch (err) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      await forgotPassword({ email: resetEmail });
      setMessage(`New code sent to ${resetEmail}`);
      setResendTimer(60);
    } catch (err) {
      setError("Network error sending code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container d-flex align-items-center justify-content-center min-vh-100">
      
      {/* --- MODALS --- */}
      {loading && <LoadingModal text={view === 'otp' ? "Verifying Code..." : "Updating Password..."} />}
      {error && <StatusModal type="error" message={error} onClose={closeStatus} />}
      {message && <StatusModal type="success" message={message} onClose={closeStatus} />}

      <div className="reset-card p-5 shadow bg-white rounded" style={{maxWidth: '500px', width: '95%'}}>
        
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
             <button className="btn btn-link text-decoration-none p-0 text-secondary fw-bold" onClick={() => navigate("/login")}>&larr; Back to Login</button>
             <div className="text-end">
                 <h2 className="text-success fw-bold m-0" style={{fontSize: '1.5rem'}}>JAKE STORE</h2>
                 <h3 className="text-muted m-0" style={{fontSize: '1rem'}}>Reset Password</h3>
             </div>
        </div>

        {/* VIEW 1: OTP INPUT */}
        {view === 'otp' && (
            <>
                <div className="text-center mb-4">
                    <p className="text-muted">
                        Enter the 6-digit code sent to <br/><strong>{resetEmail}</strong>
                    </p>
                </div>

                <form onSubmit={handleVerifyOtp}>
                    <div className="mb-4 d-flex justify-content-center">
                        <input
                            type="text"
                            className="form-control form-control-lg text-center fw-bold fs-1 border-success"
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                            maxLength="6"
                            style={{ letterSpacing: '10px', maxWidth: '250px', height: '70px' }}
                            disabled={loading}
                            autoFocus
                        />
                    </div>

                    <button type="submit" className="btn btn-success w-100 py-2 fw-bold mb-3" disabled={loading}>
                        Verify Code
                    </button>
                </form>

                <div className="text-center">
                    <button 
                        type="button" 
                        className={`btn btn-link text-decoration-none ${resendTimer > 0 ? 'text-muted' : 'text-primary'}`}
                        onClick={handleResendOtp} 
                        disabled={resendTimer > 0 || loading}
                    >
                        {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : "Resend Code"}
                    </button>
                </div>
            </>
        )}

        {/* VIEW 2: NEW PASSWORD INPUT */}
        {view === 'password' && (
            <>
                <div className="text-center mb-4">
                    <div className="text-success display-1 mb-2"><i className="bi bi-shield-lock-fill"></i></div>
                    <h5 className="fw-bold">Create New Password</h5>
                    <p className="text-muted small">Your identity has been verified.</p>
                </div>

                <form onSubmit={handleReset}>
                    <label className="form-label small fw-bold text-muted">New Password</label>
                    <div className="input-group mb-3">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            placeholder="Enter new password"
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                            disabled={loading}
                            autoFocus
                        />
                        <button className="btn btn-outline-secondary" type="button" onClick={() => setShowPassword(!showPassword)}>
                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                    </div>
                    
                    <label className="form-label small fw-bold text-muted">Confirm Password</label>
                    <div className="input-group mb-4">
                        <input
                            type={showConfirm ? "text" : "password"}
                            className="form-control"
                            placeholder="Confirm new password"
                            value={confirmPass}
                            onChange={(e) => setConfirmPass(e.target.value)}
                            disabled={loading}
                        />
                        <button className="btn btn-outline-secondary" type="button" onClick={() => setShowConfirm(!showConfirm)}>
                            <i className={`bi ${showConfirm ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                    </div>

                    <button type="submit" className="btn btn-success w-100 py-2 fw-bold" disabled={loading}>
                        Update Password
                    </button>
                </form>
            </>
        )}

      </div>
    </div>
  );
}

export default ResetPassword;