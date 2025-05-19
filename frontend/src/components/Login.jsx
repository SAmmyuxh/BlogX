import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import authService from '../services/authService'; // Ensure this is correctly imported
import { handleerror, handlesuccess } from '../utils';
import {
  EnvelopeIcon,
  LockClosedIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ArrowRightOnRectangleIcon, // For main page icon or Login button
  SparklesIcon, // Optional: For App Logo on top
} from '@heroicons/react/24/outline';

const InputField = ({ id, name, type, placeholder, value, onChange, icon: Icon, autoComplete }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
    </div>
    <input
      id={id}
      name={name}
      type={type}
      autoComplete={autoComplete}
      required
      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password.trim()) {
        setError('Both email and password are required.');
        return;
    }

    setLoading(true);
    try {
      // authService.login should return an object like { success: true, name: 'User Name', jwttoken: '...' }
      // or throw an error / return { success: false, message: '...' }
      const response = await authService.login(formData);

      // Check if login was successful based on your authService response structure
      // The original code implies response.success and response.jwttoken
      // If your service throws an error on failure, the catch block will handle it.
      // If it returns a specific structure for failure, adjust here.
      // For this example, assuming if it doesn't throw, it's successful with name and token.
      // If response.jwttoken is the actual token and response.user.name for the name:
      
      // Assuming login response is { user: { name: 'John Doe' }, token: 'jwttoken' }
      // Or simply { name: 'John Doe', token: 'jwttoken' }
      // The original had response.name and response.jwttoken
      
      // If authService.login throws on error, this block implies success
      login(response.user || { name: response.name }, response.token || response.jwttoken); // Adapt to your response structure
      handlesuccess('Login successful! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500); // Slightly faster redirect

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to login. Please check your credentials.';
      setError(errorMessage);
      // handleerror(errorMessage); // If you also want a toast for login errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Optional: Logo */}
        {/* <Link to="/" className="inline-block mb-6">
            <SparklesIcon className="h-12 w-auto text-indigo-600" />
        </Link> */}
        <ArrowRightOnRectangleIcon className="mx-auto h-12 w-auto text-indigo-600" />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to BlogSphere
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md" role="alert">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <InputField
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                icon={EnvelopeIcon}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                {/* Optional: Forgot password link */}
                {/* <div className="text-sm">
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                    Forgot your password?
                  </a>
                </div> */}
              </div>
              <InputField
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                icon={LockClosedIcon}
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="animate-spin h-5 w-5 mr-3" />
                    Signing In...
                  </>
                ) : (
                  <>
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2 transform -scale-x-100" /> {/* Flipped for login direction */}
                  Sign In
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;