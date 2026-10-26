// Register Page
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dice1, Dice2, Dice3, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button, Input } from '@monopoly/ui-components';

export function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error: authError, clearError } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'username':
        if (!value) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (value.length > 32) return 'Username must be less than 32 characters';
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) return 'Username can only contain letters, numbers, underscore, and hyphen';
        return '';
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== password) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const handleBlur = (name: string, value: string) => {
    const error = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    clearError();

    // Validate all fields
    const errors = {
      username: validateField('username', username),
      email: validateField('email', email),
      password: validateField('password', password),
      confirmPassword: validateField('confirmPassword', confirmPassword),
    };

    const hasErrors = Object.values(errors).some(e => e);
    setFieldErrors(errors);

    if (hasErrors) return;

    try {
      await register(username, email, password);
      navigate('/lobbies');
    } catch (err: any) {
      setFormError(err.message || 'Registration failed');
    }
  };

  const passwordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
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

        {/* Register Card */}
        <motion.div
          className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white text-center mb-2">Create Account</h2>
          <p className="text-gray-400 text-center mb-8">Join the game and start playing</p>

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
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={(e) => handleBlur('username', e.target.value)}
              placeholder="Choose a username"
              leftIcon={<User className="w-5 h-5" />}
              required
              autoComplete="username"
              error={fieldErrors.username}
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={(e) => handleBlur('email', e.target.value)}
              placeholder="you@example.com"
              leftIcon={<Mail className="w-5 h-5" />}
              required
              autoComplete="email"
              error={fieldErrors.email}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                // Re-validate confirm password when password changes
                if (confirmPassword) handleBlur('confirmPassword', confirmPassword);
              }}
              onBlur={(e) => handleBlur('password', e.target.value)}
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
              autoComplete="new-password"
              error={fieldErrors.password}
            />

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded transition-colors ${
                        passwordStrength() >= level
                          ? level <= 2
                            ? 'bg-red-500'
                            : level <= 3
                            ? 'bg-yellow-500'
                            : level <= 4
                            ? 'bg-blue-500'
                            : 'bg-green-500'
                          : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  {['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength() - 1] || 'Very Weak'}
                </p>
              </div>
            )}

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={(e) => handleBlur('confirmPassword', e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              required
              autoComplete="new-password"
              error={fieldErrors.confirmPassword}
            />

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 mt-0.5 rounded border-gray-600 bg-gray-800 text-monopoly-red focus:ring-monopoly-red"
              />
              <label htmlFor="terms" className="text-sm text-gray-300">
                I agree to the{' '}
                <Link to="/terms" className="text-monopoly-red hover:text-red-400">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-monopoly-red hover:text-red-400">Privacy Policy</Link>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={isLoading}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-monopoly-red hover:text-red-400 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Features hint */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: Dice1, label: 'Fair Play' },
            { icon: CheckCircle, label: 'Verified' },
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