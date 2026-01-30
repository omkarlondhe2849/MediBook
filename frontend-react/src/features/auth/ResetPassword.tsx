import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../shared/api/client';
import Button from '../../shared/components/Button';
import Input from '../../shared/components/Input';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ token: '', password: '', confirmPassword: '' });
  const [state, setState] = useState({ loading: false, error: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setState({ ...state, error: "Passwords don't match" });
      return;
    }

    setState({ loading: true, error: '' });
    try {
      await api.post('/auth/reset-password', {
        token: formData.token,
        password: formData.password
      });
      alert('Password reset successfully. Please login.');
      navigate('/login');
    } catch (error: any) {
      setState({ loading: false, error: error.message || 'Failed to reset password' });
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md card">
        <h2 className="text-2xl font-bold text-center mb-6">Set New Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Reset Token (from email)"
            required
            value={formData.token}
            onChange={(e) => setFormData({ ...formData, token: e.target.value })}
          />
          <Input
            label="New Password"
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <Input
            label="Confirm Password"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />

          {state.error && <p className="text-red-500 text-sm">{state.error}</p>}

          <Button type="submit" fullWidth isLoading={state.loading}>
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
