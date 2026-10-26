// Login Page
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dice1, Dice2, Dice3, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button, Input } from '@monopoly/ui-components';
import { useToast } from '@monopoly/ui-components';

export function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error: authError, clearError } = useAuth();
  const { error: toastError } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    clearError();

    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      navigate('/lobbies');
    } catch (err: any) {
      setFormError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-monopoly-red to-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-monopoly-red/25">
              <span className="font-bold text-white text-4xl">M</span>
            </div>
            <div className="text-left">
              <h1 className="font-display text-3xl font-bold text-white">Monopoly</h1>
              <p className="text-monopoly-red font-medium">Advanced Edition</p>
            </div>
          </Link>
        </div>

        {/* Login Card */}
        <motion.div
          className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white text-center mb-2">Welcome Back</h2>
          <p className="text-gray-400 text-center mb-8">Sign in to your account to continue</p>

          {/* Error Messages */}
          {(formError || authError) && (
            <motion.div
              className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-start gap-3 text-red-300"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{formError || authError}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              leftIcon={<Mail className="w-5 h-5" />}
              required
              autoComplete="email"
              error={formError || authError ? undefined : undefined}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              rightIcon={
                <button
                  type="button"
                  className="text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
              required
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-monopoly-red focus:ring-monopoly-red" />
                <span className="text-sm text-gray-300">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-monopoly-red hover:text-red-400">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-monopoly-red hover:text-red-400 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Features hint */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: Dice1, label: 'Fair Dice' },
            { icon: Users, label: 'Multiplayer' },
            { icon: Shield, label: 'Secure' },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              className="p-3 bg-gray-900/30 border border-gray-800 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <item.icon className="w-6 h-6 text-gray-500 mx-auto mb-1" />
              <p className="text-xs text-gray-400">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}