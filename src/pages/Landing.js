import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ConnectSphereLogo from '../components/ConnectSphereLogo'; 

const Landing = () => {
  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center relative"
      style={{
        backgroundImage: `url('/assets/background-doodles.png')`,
      }}
    >
      {/* Cherry Red Glassmorphism overlay */}
      <div className="absolute inset-0 bg-red-100 bg-opacity-50 backdrop-blur-md"></div>

      {/* Main content wrapper */}
      <div className="relative z-10 flex-grow flex items-center justify-center">
        <div className="text-center px-6">
          {/* Header */}
          <motion.h1
            className="text-5xl font-extrabold text-red-600 mb-4 drop-shadow-xl"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
             {/* 🌸 Logo at the top */}
        <div className="flex justify-center mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ConnectSphereLogo width={100} height={100} />
          </motion.div>
        </div>
            🍒 Welcome to ConnectSphere
          </motion.h1>
          <motion.p
            className="text-gray-800 text-lg mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Your social universe to share moments, meet friends, and explore vibrant communities.
            <span className="text-red-500 font-semibold"> Connect. Share. Explore. 🌐</span>
          </motion.p>

          {/* Features Section */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
          >
            {[
              { emoji: '📸', title: 'Share', text: 'Post your thoughts, photos, and videos with your friends and followers.' },
              { emoji: '🤝', title: 'Connect', text: 'Find people who share your interests and build your own vibrant community.' },
              { emoji: '🌎', title: 'Explore', text: 'Discover new trends, ideas, and inspiration from around the world.' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-xl p-6 hover:scale-105 transition transform hover:shadow-2xl"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-2xl font-bold text-red-500 mb-2">{feature.emoji} {feature.title}</h3>
                <p className="text-gray-700">{feature.text}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Call to Action Buttons */}
          <motion.div
            className="flex gap-6 justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Link
              to="/login"
              className="px-6 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg transition duration-300 transform hover:scale-110"
            >
              Login 🚀
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 rounded-full bg-red-300 hover:bg-red-400 text-gray-800 font-semibold shadow-lg transition duration-300 transform hover:scale-110"
            >
              Register 💖
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Footer pinned at the bottom */}
      <footer className="relative z-10 text-center text-gray-500 py-4">
        &copy; {new Date().getFullYear()} ConnectSphere. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;





