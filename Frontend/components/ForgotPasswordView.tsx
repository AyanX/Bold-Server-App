import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPasswordView: React.FC = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP/Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  // Handle OTP resend countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Check password strength
  const checkPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setPassword(pwd);
    checkPasswordStrength(pwd);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (response.ok) {
        setStep(2);
        setOtpSent(true);
        setResendCountdown(60); // 60 seconds before allowing resend
        setMessage('✓ OTP sent to your email. Please check your inbox and spam folder.');
      } else {
        setError(data.message || 'Email not found in our system.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (response.ok) {
        setResendCountdown(60);
        setMessage('✓ New OTP sent to your email.');
        setOtp(''); // Clear previous OTP
      } else {
        setError(data.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP code.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (passwordStrength < 2) {
      setError('Password is too weak. Use uppercase, lowercase, numbers, and symbols.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp,
          password,
          password_confirmation: confirmPassword
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage('✓ Password reset successfully. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Failed to reset password. Please check your OTP and try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-300';
    if (passwordStrength === 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-yellow-500';
    if (passwordStrength === 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength === 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-20">
      <div className="max-w-md w-full bg-white p-12 shadow-2xl border border-gray-100 rounded-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black logo-brand italic text-[#001733] mb-2">Reset Password</h1>
          <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Secure Account Recovery</p>
          {step === 2 && <p className="text-xs text-gray-500 mt-3">Step 2 of 2: Create New Password</p>}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold border-l-4 border-red-500 rounded">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-6 p-4 bg-green-50 text-green-600 text-xs font-bold border-l-4 border-green-500 rounded">
            {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="w-full border border-gray-200 py-3 px-4 text-sm focus:outline-none focus:border-[#001733] focus:ring-1 focus:ring-[#001733] bg-gray-50 rounded transition"
                placeholder="name@company.com"
                autoFocus
                required
              />
              <p className="text-xs text-gray-400 mt-2">
                Enter the email address associated with your account
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-[#001733] text-white py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-black transition-colors disabled:bg-gray-400 rounded"
              disabled={loading || !email}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="inline-block mr-2">⏳</span> Sending OTP...
                </span>
              ) : (
                'Send OTP Code'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500">OTP Code</label>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCountdown > 0}
                  className={`text-xs font-bold uppercase tracking-widest ${
                    resendCountdown > 0
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-[#001733] hover:text-black'
                  }`}
                >
                  {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}
                </button>
              </div>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                  setOtp(val);
                  setError('');
                }}
                className="w-full border border-gray-200 py-3 px-4 text-sm focus:outline-none focus:border-[#001733] focus:ring-1 focus:ring-[#001733] bg-gray-50 rounded transition text-center text-2xl letter-spacing tracking-[0.5em] font-mono"
                placeholder="000000"
                autoFocus
                maxLength={6}
                required
              />
              <p className="text-xs text-gray-400 mt-2">Check your email for the 6-digit code</p>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-200 py-3 px-4 text-sm focus:outline-none focus:border-[#001733] focus:ring-1 focus:ring-[#001733] bg-gray-50 rounded transition"
                  placeholder="Enter new password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#001733] text-[10px] font-bold uppercase"
                >
                  {showPassword ? '👁️ Hide' : '👁️‍🗨️ Show'}
                </button>
              </div>
              {password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-500">Password Strength:</p>
                    <p className={`text-xs font-bold ${
                      passwordStrength === 1 ? 'text-red-500' :
                      passwordStrength === 2 ? 'text-yellow-500' :
                      passwordStrength === 3 ? 'text-blue-500' :
                      passwordStrength === 4 ? 'text-green-500' : 'text-gray-400'
                    }`}>
                      {getPasswordStrengthText()}
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${getPasswordStrengthColor()} h-2 rounded-full transition-all`}
                      style={{ width: `${(passwordStrength / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full border border-gray-200 py-3 px-4 text-sm focus:outline-none focus:border-[#001733] focus:ring-1 focus:ring-[#001733] bg-gray-50 rounded transition"
                  placeholder="Confirm new password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#001733] text-[10px] font-bold uppercase"
                >
                  {showPassword ? '👁️ Hide' : '👁️‍🗨️ Show'}
                </button>
              </div>
              {confirmPassword && (
                <p className={`text-xs mt-2 ${password === confirmPassword ? 'text-green-500' : 'text-red-500'}`}>
                  {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#001733] text-white py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-black transition-colors disabled:bg-gray-400 rounded"
              disabled={loading || !otp || !password || password !== confirmPassword}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="inline-block mr-2">⏳</span> Resetting Password...
                </span>
              ) : (
                '✓ Reset Password'
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          {step === 2 && (
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp('');
                setPassword('');
                setConfirmPassword('');
                setMessage('');
                setError('');
              }}
              className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#001733] mb-3 block w-full"
            >
              ← Use Different Email
            </button>
          )}
          <Link
            to="/login"
            className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#001733] inline-block"
          >
            Return to Login →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordView;
