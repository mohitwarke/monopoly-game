// Forgot Password Page
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dice1, Dice2, Dice3, Mail, Lock, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button, Input } from '@monopoly/ui-components';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'sent' | 'reset'>('email');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email) {
      setError('Please enter your email');
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep('sent');
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep('reset');
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    let strength = 0;
    if (newPassword.length >= 8) strength++;
    if (/[A-Z]/.test(newPassword)) strength++;
    if (/[a-z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword)) strength++;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength++;
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

        {/* Card */}
        <motion.div
          className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          {step === 'email' && (
            <>
              <h2 className="text-2xl font-bold text-white text-center mb-2">Forgot Password?</h2>
              <p className="text-gray-400 text-center mb-8">Enter your email and we'll send you a reset link</p>

              {error && (
                <motion.div
                  className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-start gap-3 text-red-300"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmitEmail} className="space-y-5">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  leftIcon={<Mail className="w-5 h-5" />}
                  required
                  autoComplete="email"
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={isLoading}
                >
                  Send Reset Link
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  Remember your password?{' '}
                  <Link to="/login" className="text-monopoly-red hover:text-red-400 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}

          {step === 'sent' && (
            <>
              <div className="text-center mb-8">
                <motion.div
                  className="w-16 h-16 bg-green-900/30 border border-green-700 rounded-full flex items-center justify-center mx-auto mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
                <p className="text-gray-400">We've sent a password reset link to <strong className="text-white">{email}</strong></p>
                <p className="text-gray-500 text-sm mt-2">The link will expire in 1 hour</p>
              </div>

              <div className="space-y-3">
                <Button variant="outline" className="w-full" onClick={() => setStep('email')}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <Button variant="primary" className="w-full" onClick={() => navigate('/login')}>
                  Go to Login
                </Button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">Didn't receive the email?{' '}
                  <button className="text-monopoly-red hover:text-red-400 font-medium" onClick={() => setStep('email')}>
                    Resend
                  </button>
                </p>
              </div>
            </>
          )}

          {step === 'reset' && (
            <>
              <div className="text-center mb-8">
                <motion.div
                  className="w-16 h-16 bg-green-900/30 border border-green-700 rounded-full flex items-center justify-center mx-auto mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
                <p className="text-gray-400">Your password has been successfully updated</p>
              </div>

              <div className="space-y-3">
                <Button variant="primary" className="w-full" onClick={() => navigate('/login')}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Sign In
                </Button>
              </div>
            </>
          )}
        </motion.div>

        {/* Features hint */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: Dice1, label: 'Fair Play' },
            { icon: Lock, label: 'Secure' },
            { icon: Shield, label: 'Protected' },
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