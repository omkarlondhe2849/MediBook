import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../shared/api/client';
import Button from '../../shared/components/Button';
import Input from '../../shared/components/Input';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await api.post('/auth/forgot-password', { email });
      setStatus('success');
    } catch (error) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md card text-center">
          <h2 className="text-2xl font-bold mb-4">Check your email</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            We've sent a password reset link/token to <b>{email}</b>.
          </p>
          <Link to="/reset-password">
            <Button fullWidth>Enter Reset Token</Button>
          </Link>
          <Link to="/login" className="block mt-4 text-sm text-primary hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md card">
        <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {status === 'error' && <p className="text-red-500 text-sm">Failed to send reset email. Try again.</p>}

          <Button type="submit" fullWidth isLoading={status === 'loading'}>
            Send Reset Link
          </Button>

          <Link to="/login" className="block text-center text-sm text-[var(--text-secondary)] hover:text-primary">
            Back to Login
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
