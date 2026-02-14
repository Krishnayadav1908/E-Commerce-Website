import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCartContext } from "../../Context";
import Layout from "../../Components/Layout";

function SignUp() {
  const context = useContext(ShoppingCartContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [info, setInfo] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpLockout, setOtpLockout] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (otpLockout <= 0) return undefined;
    const timer = setInterval(() => {
      setOtpLockout((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpLockout]);

  const formatSeconds = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  //(B)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Password validation
    const password = formData.password;
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number");
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError(
        'Password must contain at least one special character (!@#$%^&*(),.?":{}<>)',
      );
      return;
    }

    const result = await context.handleSignUp(
      formData.name,
      formData.email,
      formData.password,
    );

    if (result?.success && result?.requiresOtp) {
      setOtpEmail(result.email || formData.email);
      setOtpStep(true);
      setInfo("We sent a 6-digit OTP to your email.");
      setError("");
      setResendCooldown(60);
    } else if (result?.success) {
      navigate("/my-account");
    } else {
      setError(result?.message || "Registration failed. Please try again.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const result = await context.handleVerifyOtp(otpEmail, otp);
    if (result?.success) {
      navigate("/my-account");
    } else {
      if (result?.retryAfterSeconds) {
        setOtpLockout(result.retryAfterSeconds);
      }
      setError(result?.message || "OTP verification failed.");
    }
  };

  const handleResendOtp = async () => {
    const result = await context.handleResendOtp(otpEmail);
    if (result?.success) {
      setInfo("OTP resent. Please check your email.");
      setError("");
      setResendCooldown(60);
    } else {
      if (result?.retryAfterSeconds) {
        setResendCooldown(result.retryAfterSeconds);
      }
      setError(result?.message || "Unable to resend OTP.");
    }
  };

  const handleBackToSignup = () => {
    setOtpStep(false);
    setOtp("");
    setInfo("");
    setError("");
    setResendCooldown(0);
    setOtpLockout(0);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-80px)] flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Create an account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          {otpStep ? (
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Enter OTP
                </label>
                <div className="mt-2">
                  <input
                    id="otp"
                    type="text"
                    name="otp"
                    placeholder="6-digit code"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black px-2"
                  />
                </div>
              </div>

              {info && <p className="text-green-600 text-sm">{info}</p>}
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {otpLockout > 0 && (
                <p className="text-amber-600 text-sm">
                  Try again in {formatSeconds(otpLockout)}.
                </p>
              )}

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={otpLockout > 0}
                  className="flex justify-center rounded-md bg-black px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  Verify OTP
                </button>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0}
                    className="text-sm font-semibold text-black hover:text-gray-800 disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    {resendCooldown > 0
                      ? `Resend in ${formatSeconds(resendCooldown)}`
                      : "Resend OTP"}
                  </button>
                  <button
                    type="button"
                    onClick={handleBackToSignup}
                    className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                  >
                    Back
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Name
                </label>
                <div className="mt-2">
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black px-2"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black px-2"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black px-2"
                  />
                  <p className="mt-2 text-xs text-gray-600">
                    Password must contain:
                    <br />• At least 8 characters
                    <br />• One uppercase letter (A-Z)
                    <br />• One lowercase letter (a-z)
                    <br />• One number (0-9)
                    <br />• One special character
                    (!@#$%^&*(),.?":&#123;&#125;|&lt;&gt;)
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Confirm password
                </label>
                <div className="mt-2">
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black px-2"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  Create account
                </button>
              </div>
            </form>
          )}

          <p className="mt-10 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/sign-in"
              className="font-semibold leading-6 text-black hover:text-gray-800"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default SignUp;
