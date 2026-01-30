import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../shared/context/AuthContext';
import { useToast } from '../../shared/context/ToastContext';
import { api } from '../../shared/api/client';
import Button from '../../shared/components/Button';
import Input from '../../shared/components/Input';
import AnimatedText from '../../shared/components/AnimatedText';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await api.post<any>('/auth/login', {
                email: formData.email,
                password: formData.password
            });

            if (response.token) {
                login(response.user, response.token);

                let targetPath = '/dashboard';
                if (response.user.role === 'ADMIN') {
                    targetPath = '/admin';
                } else if (response.user.role === 'DOCTOR') {
                    // Check if profile exists
                    try {
                        await api.get(`/doctors/profile/me?providerId=${response.user.id}`);
                        targetPath = '/dashboard';
                    } catch (error: any) {
                        if (error.response && error.response.status === 404) {
                            targetPath = '/create-doctor-profile';
                            showToast('Please complete your profile to continue.', 'info');
                        }
                    }
                }

                showToast(`Welcome back, ${response.user.name}!`, 'success');
                navigate(targetPath);
            } else {
                showToast('Invalid response from server', 'error');
            }
        } catch (err: any) {
            const msg = err.response?.data || 'Login failed';
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
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-primary-dark to-primary text-white p-12 relative overflow-hidden"
            >
                <div className="relative z-10 max-w-md text-center">
                    <AnimatedText text="Welcome Back" type="slide-up" className="text-5xl font-bold mb-6 font-heading" />
                    <p className="text-lg text-primary-light mb-8 font-light">
                        Seamlessly manage your practice or appointments with our premium healthcare platform.
                    </p>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl"
                    >
                        <p className="italic font-medium text-lg">"The best way to find yourself is to lose yourself in the service of others."</p>
                        <p className="mt-4 font-bold text-indigo-200 text-right uppercase tracking-wider text-sm">- Mahatma Gandhi</p>
                    </motion.div>
                </div>

                {/* Decorations */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ scale: [1, 1.5, 1], rotate: [0, -45, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary/30 rounded-full blur-3xl"
                />
            </motion.div>

            {/* Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 relative">
                <div className="absolute inset-0 mesh-gradient opacity-30"></div>
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-md relative z-10 bg-white p-10 rounded-2xl shadow-xl border border-slate-100"
                >
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-slate-900 mb-2 font-heading">Sign In</h1>
                        <p className="text-slate-500 font-medium">Access your personalized dashboard</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="doctor@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoFocus
                        />

                        <div>
                            <Input
                                label="Password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <div className="text-right mt-2">
                                <Link to="/forgot-password" className="text-sm text-primary font-semibold hover:text-primary-dark transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100 font-medium flex items-center gap-2"
                            >
                                <span className="text-lg">⚠️</span> {error}
                            </motion.div>
                        )}

                        <Button type="submit" fullWidth isLoading={isLoading} className="btn-primary py-4 text-lg w-full shadow-lg shadow-primary/30">
                            Sign In
                        </Button>

                        <div className="text-center text-sm text-slate-500 mt-8 font-medium">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-bold text-primary hover:text-primary-dark transition-colors">
                                Create an account
                            </Link>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
