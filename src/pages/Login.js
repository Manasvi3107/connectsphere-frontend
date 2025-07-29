import React, { useState, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify'; // ✅ Added toast import
import ConnectSphereLogo from '../components/ConnectSphereLogo'; // ✅ Import logo

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🟢 Fix: use formData values instead of undefined variables
      const res = await API.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      login(res.data.token, res.data.user); // Save user + token
      toast.success('🎉 Login successful!');
      navigate('/dashboard'); // Redirect to dashboard
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url('/assets/background-doodles.png')` }}
    >
      {/* Soft overlay */}
      <div className="absolute inset-0 bg-pink-100 bg-opacity-40 backdrop-blur-sm"></div>

      {/* Pop-up Card */}
      <motion.div
        whileHover={{ scale: 1.05, boxShadow: '0 20px 30px rgba(0,0,0,0.2)' }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="relative z-10 p-8 bg-white rounded-3xl shadow-2xl w-full max-w-md border-4 border-pink-400"
      >
        {/* 🌸 Logo at the top */}
        <div className="flex justify-center mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ConnectSphereLogo width={80} height={80} />
          </motion.div>
        </div>

        <motion.h2
          className="text-3xl font-bold mb-6 text-center text-pink-600"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Welcome Back 👋
        </motion.h2>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="📧 Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <input
            name="password"
            type="password"
            placeholder="🔒 Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-semibold text-lg ${
              loading
                ? 'bg-pink-300 cursor-not-allowed'
                : 'bg-pink-500 hover:bg-pink-600 transition duration-300'
            }`}
          >
            {loading ? 'Logging in...' : 'Login 🚀'}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Don’t have an account?{' '}
          <Link
            to="/register"
            className="text-pink-500 hover:underline font-semibold"
          >
            Register here 💖
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
