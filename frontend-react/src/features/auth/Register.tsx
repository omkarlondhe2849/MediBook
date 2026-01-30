import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../shared/api/client';
import Button from '../../shared/components/Button';
import Input from '../../shared/components/Input';
import { useToast } from '../../shared/context/ToastContext';
import AnimatedText from '../../shared/components/AnimatedText';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'PATIENT',
        phone: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await api.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                phone: formData.phone
            });

            showToast('Registration successful! Please login.', 'success');
            navigate('/login');
        } catch (err: any) {
            const msg = err.response?.data || 'Registration failed';
            showToast(msg, 'error');
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-stretch min-h-[calc(100vh-var(--header-height))] bg-white overflow-hidden">
            {/* Brand */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-gradient-to-bl from-secondary to-primary-dark text-white p-12 relative overflow-hidden"
            >
                <div className="relative z-10 max-w-md text-center">
                    <AnimatedText text="Join Medibook" type="slide-up" className="text-5xl font-bold mb-6 font-heading" />
                    <p className="text-lg text-indigo-100 mb-8 font-light">
                        Create your profile to book appointments, manage health records, or grow your medical practice.
                    </p>
                    <div className="grid grid-cols-1 gap-4 text-left">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10"
                        >
                            <span className="text-3xl">🚀</span>
                            <div>
                                <h3 className="font-bold text-lg">Fast & Simple</h3>
                                <p className="text-sm opacity-90">Book appointments in seconds.</p>
                            </div>
                        </motion.div>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, marginTop: 20 }}
                        animate={{ opacity: 1, marginTop: 32 }}
                        transition={{ delay: 0.6 }}
                        className="p-6 bg-white/20 rounded-2xl border border-white/20 shadow-lg"
                    >
                        <p className="italic font-medium">"I found the perfect cardiologist in minutes. Highly recommended!"</p>
                    </motion.div>
                </div>

                {/* Decorations */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"
                />
                <motion.div
                    animate={{ scale: [1, 1.5, 1], rotate: [0, 45, 0] }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-0 left-0 w-80 h-80 bg-primary/30 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"
                />
            </motion.div>

            {/* Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 overflow-y-auto relative">
                <div className="absolute inset-0 mesh-gradient opacity-30"></div>
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-md py-8 relative z-10 bg-white p-10 rounded-2xl shadow-xl border border-slate-100"
                >
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black text-slate-900 mb-2 font-heading">Create Account</h1>
                        <p className="text-slate-500 font-medium">Start your health journey today</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <Input
                            label="Full Name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            autoFocus
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@example.com"
                            />
                            <Input
                                label="Phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+1 234..."
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label mb-2 block font-bold text-slate-700">I am a...</label>
                            <div className="relative">
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="input-field appearance-none cursor-pointer w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:border-primary focus:ring-4 focus:ring-primary-light outline-none transition-all duration-200"
                                >
                                    <option value="PATIENT">Patient (Book Appointments)</option>
                                    <option value="DOCTOR">Doctor (Provide Services)</option>
                                    <option value="ADMIN">Admin (Manage Platform)</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                                    ▼
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                            />
                            <Input
                                label="Confirm"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100 text-center font-medium"
                            >
                                ⚠️ {error}
                            </motion.div>
                        )}

                        <Button type="submit" fullWidth isLoading={isLoading} className="btn-primary py-4 text-lg mt-4 w-full shadow-lg shadow-primary/30">
                            Create Account
                        </Button>

                        <div className="text-center text-sm text-slate-500 mt-6 font-medium">
                            Already have an account?{' '}
                            <Link to="/login" className="font-bold text-primary hover:text-primary-dark transition-colors">
                                Sign in instead
                            </Link>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
