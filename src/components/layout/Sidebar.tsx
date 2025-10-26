import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  MapPin,
  FileText,
  Star,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Bot,
  Settings,
  Menu,
  X,
  Link2
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/locations', label: 'Locations', icon: MapPin },
  { path: '/posts', label: 'Posts', icon: FileText },
  { path: '/reviews', label: 'Reviews', icon: Star },
  { path: '/citations', label: 'Citations', icon: Link2 },
  { path: '/insights', label: 'Insights', icon: TrendingUp },
  { path: '/ai-settings', label: 'AI Settings', icon: Bot },
  { path: '/settings', label: 'Settings', icon: Settings },
];

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.div
        initial={{ x: -250 }}
        animate={{ x: 0, width: collapsed ? 80 : 250 }}
        transition={{ duration: 0.3 }}
        className="hidden lg:flex bg-black border-r border-white/10 flex-col"
      >
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          {!collapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-3"
            >
              <img src="/nnh-logo.png" alt="NNH Logo" className="w-8 h-8" />
              <h1 className="text-xl font-bold text-white">NNH AI Studio</h1>
            </motion.div>
          ) : (
            <img src="/nnh-logo.png" alt="NNH Logo" className="w-10 h-10 mx-auto" />
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
        {!collapsed && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-white/70 mt-1"
          >
            GMB Dashboard
          </motion.p>
        )}
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link to={item.path}>
                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center p-3 rounded-lg transition-all duration-200 border ${
                      isActive
                        ? 'bg-white/10 text-white border-white/20'
                        : 'bg-transparent text-white hover:bg-white/5 border-transparent'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </motion.div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </motion.div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-black border-r border-white/10 flex flex-col z-50"
          >
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img src="/nnh-logo.png" alt="NNH Logo" className="w-8 h-8" />
                  <h1 className="text-xl font-bold text-white">NNH AI Studio</h1>
                </div>
              </div>
              <p className="text-sm text-white/70">GMB Dashboard</p>
            </div>

            <nav className="flex-1 p-4 overflow-y-auto">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <li key={item.path}>
                      <Link to={item.path} onClick={() => setMobileOpen(false)}>
                        <motion.div
                          whileTap={{ scale: 0.95 }}
                          className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-white/10 text-white'
                              : 'text-white hover:bg-white/5'
                          }`}
                        >
                          <Icon className="w-5 h-5 mr-3" />
                          <span className="font-medium">{item.label}</span>
                        </motion.div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;