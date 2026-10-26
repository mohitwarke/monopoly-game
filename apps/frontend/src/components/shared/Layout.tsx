// Shared Layout Component
import { Outlet, NavLink, useLocation, useState } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, Trophy, Settings, Puzzle, LogOut, LayoutDashboard, Home, Users, Gamepad2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useGameStore } from '../../store/gameStore';
import { Button } from '@monopoly/ui-components';
import clsx from 'clsx';

const navigation = [
  { name: 'Home', href: '/', icon: Home, public: true },
  { name: 'Lobbies', href: '/lobbies', icon: Users, public: false },
  { name: 'Game', href: '/game', icon: Gamepad2, public: false, conditional: true },
  { name: 'Tournaments', href: '/tournaments', icon: Trophy, public: false },
  { name: 'Modding', href: '/modding', icon: Puzzle, public: false },
  { name: 'Profile', href: '/profile', icon: User, public: false },
  { name: 'Settings', href: '/settings', icon: Settings, public: false },
];

export function Layout() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { currentGameId } = useGameStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const filteredNavigation = navigation.filter(item => {
    if (item.public) return true;
    if (!isAuthenticated) return false;
    if (item.conditional && !currentGameId) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        <motion.aside
          className={clsx(
            'fixed top-0 left-0 z-50 h-full bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 lg:translate-x-0',
            sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
          )}
          initial={{ x: -256 }}
          animate={{ x: sidebarOpen ? 0 : -256 }}
          exit={{ x: -256 }}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
              <NavLink to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-monopoly-red rounded-lg flex items-center justify-center">
                  <span className="font-bold text-white text-lg">M</span>
                </div>
                <span className="font-display text-xl text-white">Monopoly</span>
              </NavLink>
              <button
                className="lg:hidden p-2 text-gray-400 hover:text-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {filteredNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-monopoly-red/20 text-monopoly-red'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    )
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {item.name}
                </NavLink>
              ))}
            </nav>

            {/* User section */}
            {isAuthenticated && (
              <div className="p-4 border-t border-gray-800">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user?.username?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  <NavLink
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                    onClick={() => { setSidebarOpen(false); setUserMenuOpen(false); }}
                  >
                    <User className="w-5 h-5" />
                    Profile
                  </NavLink>
                  <NavLink
                    to="/settings"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                    onClick={() => { setSidebarOpen(false); setUserMenuOpen(false); }}
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </NavLink>
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                    onClick={() => { logout(); setSidebarOpen(false); setUserMenuOpen(false); }}
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Main content */}
      <div className="lg:pl-64 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <button
              className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            <div className="flex-1 lg:flex-none">
              {/* Page title could go here */}
            </div>

            <div className="flex items-center gap-4">
              {/* Game status indicator */}
              {currentGameId && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-monopoly-red/20 text-monopoly-red rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-monopoly-red rounded-full animate-pulse" />
                  In Game
                </div>
              )}

              {/* User menu */}
              {isAuthenticated && (
                <div className="relative">
                  <button
                    className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {user?.username?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                    <span className="hidden sm:block text-sm font-medium">{user?.username}</span>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 z-50"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <NavLink
                          to="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="w-5 h-5" />
                          Profile
                        </NavLink>
                        <NavLink
                          to="/settings"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="w-5 h-5" />
                          Settings
                        </NavLink>
                        <hr className="border-gray-700 my-1" />
                        <button
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300"
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                        >
                          <LogOut className="w-5 h-5" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {!isAuthenticated && (
                <div className="flex items-center gap-2">
                  <NavLink
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Login
                  </NavLink>
                  <Button variant="primary" size="sm" asChild>
                    <NavLink to="/register">Sign Up</NavLink>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}