import React, { useState } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ConnectSphereLogo from '../components/ConnectSphereLogo'; // ✅ Import logo

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      console.error('Register error:', err);
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url('/assets/background-doodles.png')` }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-purple-100 bg-opacity-40 backdrop-blur-sm"></div>

      {/* Main Card with Hover Pop-up */}
      <motion.div
        whileHover={{ scale: 1.05, boxShadow: '0 20px 30px rgba(0,0,0,0.2)' }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="relative z-10 p-8 bg-white rounded-3xl shadow-2xl w-full max-w-md border-4 border-purple-400"
      >
        <motion.h2
          className="text-3xl font-bold mb-6 text-center text-purple-600"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
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
          Create Account 🌸
        </motion.h2>
        {error && (
          <p className="text-purple-700 text-sm mb-4 text-center">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            type="text"
            placeholder="👤 Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <input
            name="email"
            type="email"
            placeholder="📧 Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <input
            name="password"
            type="password"
            placeholder="🔒 Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-semibold text-lg ${
              loading
                ? 'bg-purple-300 cursor-not-allowed'
                : 'bg-purple-500 hover:bg-purple-600 transition duration-300'
            }`}
          >
            {loading ? 'Creating Account...' : 'Register ✨'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-purple-500 hover:underline font-semibold"
          >
            Login here 🚀
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
