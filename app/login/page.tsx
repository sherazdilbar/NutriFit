'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Toast from '@/components/Toast';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: '',
  });
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'info',
  });

  const showToast = (message: string, type: ToastState['type']) => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setError('Your session has expired. Please login again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate before submit
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError || passwordError) {
      setValidationErrors({
        email: emailError,
        password: passwordError,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Better error messages
        let errorMessage = '';
        if (response.status === 401) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (response.status === 404) {
          errorMessage = 'No account found with this email. Please register first.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = data.error || 'Login failed. Please check your credentials.';
        }
        setError(errorMessage);
        showToast(errorMessage, 'error');
        setLoading(false);
        return;
      }

      // Show success message
      setSuccess('Login successful! Redirecting...');
      showToast('Login successful! Redirecting to dashboard...', 'success');
      setLoading(false);

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 800);
    } catch (err) {
      const errorMessage = 'Network error. Please check your internet connection and try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      setLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Real-time validation
    if (name === 'email') {
      setValidationErrors({
        ...validationErrors,
        email: validateEmail(value),
      });
    } else if (name === 'password') {
      setValidationErrors({
        ...validationErrors,
        password: validatePassword(value),
      });
    }
  };

  return (
    <>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center group">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform">
              <span className="text-primary-600 font-bold text-3xl">N</span>
            </div>
            <span className="ml-4 text-4xl font-bold text-white">
              Nutri<span className="text-primary-200">Fit</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Your Health Journey<br />Starts Here
          </h1>
          <p className="text-xl text-primary-100 mb-8 leading-relaxed">
            Track your nutrition, manage your fitness goals, and achieve the healthy lifestyle you deserve.
          </p>
          
          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-white text-lg">Personalized Diet Plans</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-white text-lg">Custom Workout Programs</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-white text-lg">Progress Tracking & Analytics</span>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-primary-200 text-sm">
            Trusted by thousands of users worldwide
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center">
              <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="ml-3 text-2xl font-bold text-gray-900">
                Nutri<span className="text-primary-600">Fit</span>
              </span>
            </Link>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to continue your health journey</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6" aria-label="Login form">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg" role="alert" aria-live="polite">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg" role="alert" aria-live="polite">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-green-700 text-sm font-medium">{success}</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  aria-label="Email address"
                  aria-required="true"
                  aria-invalid={!!validationErrors.email}
                  aria-describedby={validationErrors.email ? "email-error" : undefined}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 ${
                    validationErrors.email 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-primary-500 focus:ring-primary-200'
                  } focus:ring-2 focus:outline-none transition-all text-gray-900`}
                  placeholder="you@example.com"
                />
              </div>
              {validationErrors.email && (
                <p id="email-error" className="mt-2 text-sm text-red-600 flex items-center" role="alert">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  aria-label="Password"
                  aria-required="true"
                  aria-invalid={!!validationErrors.password}
                  aria-describedby={validationErrors.password ? "password-error" : undefined}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 ${
                    validationErrors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-primary-500 focus:ring-primary-200'
                  } focus:ring-2 focus:outline-none transition-all text-gray-900`}
                  placeholder="••••••••"
                />
              </div>
              {validationErrors.password && (
                <p id="password-error" className="mt-2 text-sm text-red-600 flex items-center" role="alert">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {validationErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              aria-label={loading ? "Signing in, please wait" : "Sign in to your account"}
              className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] relative z-10"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center relative -top-8">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary-600 font-semibold hover:text-primary-700 hover:underline">
                Create Account
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors font-medium text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>}>
      <LoginForm />
    </Suspense>
  );
}
