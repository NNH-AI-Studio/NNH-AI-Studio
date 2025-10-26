import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

interface HeaderProps {
  transparent?: boolean;
}

function Header({ transparent = false }: HeaderProps) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const navLinks = [
    { path: '/pricing', label: 'Pricing' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className={`border-b border-neon-orange shadow-neon-orange backdrop-blur-sm fixed w-full top-0 z-50 ${transparent ? 'bg-transparent' : 'bg-black/80'}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2"
        >
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.img
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              src="/nnh-logo.png"
              alt="NNH Local - Google My Business Management Platform Logo"
              width="40"
              height="40"
              className="w-10 h-10"
            />
            <span className="text-2xl font-bold text-white group-hover:text-white/80 transition-colors">
              NNH Local
            </span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="hidden md:flex items-center space-x-8"
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="relative text-white/80 hover:text-white transition-colors py-2"
            >
              <span className="relative z-10">{link.label}</span>
              {location.pathname === link.path && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </motion.div>

        {!isAuthPage && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center space-x-4"
          >
            <Link to="/login">
              <motion.button
                onHoverStart={() => setHoveredButton('signin')}
                onHoverEnd={() => setHoveredButton(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg text-white relative overflow-hidden"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredButton === 'signin' ? 1 : 0 }}
                  className="absolute inset-0 bg-nnh-orange/10"
                />
                <span className="relative z-10">Sign In</span>
              </motion.button>
            </Link>
            <Link to="/register">
              <motion.button
                onHoverStart={() => setHoveredButton('getstarted')}
                onHoverEnd={() => setHoveredButton(null)}
                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(255,255,255,0.2)' }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold rounded-lg font-medium relative overflow-hidden"
              >
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: hoveredButton === 'getstarted' ? '100%' : '-100%' }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
                <span className="relative z-10">Get Started</span>
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}

export default Header;
