import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../shared/api/client';
import Button from '../../shared/components/Button';
import AnimatedText from '../../shared/components/AnimatedText';

const Home: React.FC = () => {
    const [stats, setStats] = React.useState({ patients: '1500+', doctors: '120+', uptime: '99.9%' });

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const res: any = await api.get('/api/users/stats');
                if (res) {
                    setStats(prev => ({
                        ...prev,
                        patients: res.patients ? res.patients.toString() : '1500+',
                        doctors: res.doctors ? res.doctors.toString() : '120+'
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch public stats", error);
            }
        };
        fetchStats();
    }, []);

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <div className="min-h-screen bg-background font-sans text-slate-900 selection:bg-primary/20 selection:text-primary-dark">
            <section className="relative overflow-hidden mesh-gradient pt-24 pb-32 lg:pt-32 lg:pb-40 border-b border-white/50">
                <div className="container mx-auto px-6 text-center z-10 relative">

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 text-secondary shadow-sm text-xs font-bold uppercase tracking-wider mb-8 cursor-default"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                        </span>
                        Next Generation Healthcare
                    </motion.div>

                    <div className="mb-8 max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-2 tracking-tight leading-[1.1]">
                            Healthcare Management,
                        </h1>
                        <div className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-light to-secondary">
                            <AnimatedText text="Simplified." type="typewriter" delay={0.5} className="justify-center" />
                        </div>
                    </div>

                    <motion.p
                        initial="hidden"
                        whileInView="visible"
                        variants={fadeInUp}
                        className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
                    >
                        The complete platform for modern clinics. Streamline appointments, manage patient records, and process payments securely in one place.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="flex flex-col sm:flex-row gap-5 justify-center"
                    >
                        <Link to="/register">
                            <Button className="btn-primary shadow-xl shadow-primary/20">
                                Get Started Free
                            </Button>
                        </Link>
                        <Link to="/services">
                            <Button className="btn-outline bg-white/80 backdrop-blur-sm">
                                Find a Doctor
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="relative -mt-24 px-6 z-20 mb-32">
                <div className="container mx-auto max-w-5xl">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={{
                            visible: { transition: { staggerChildren: 0.1 } }
                        }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {[
                            { val: stats.patients, label: 'Active Patients' },
                            { val: stats.doctors, label: 'Verified Specialists' },
                            { val: stats.uptime, label: 'Uptime Reliability' }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-xl border border-slate-100 shadow-neo-card p-8 text-center"
                            >
                                <div className="text-5xl font-black text-slate-900 mb-2 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-700">{stat.val}</div>
                                <div className="text-sm text-slate-500 font-bold uppercase tracking-wider">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <AnimatedText text="Everything you need to run your practice" type="slide-up" className="text-3xl font-bold text-slate-900 mb-4" />
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-slate-600"
                        >
                            Designed for both small clinics and large hospitals. Our modular system adapts to your specific needs.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: '📅', title: 'Smart Scheduling', desc: ' Automated booking system that reduces no-shows and optimizes doctor availability.' },
                            { icon: '💳', title: 'Integrated Payments', desc: 'Accept credit cards and cash payments seamlessly with transparent tracking.' },
                            { icon: '🛡️', title: 'Secure Records', desc: 'HIPAA-ready digital health records accessible 24/7 by authorized personnel.' },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ scale: 1.03 }}
                                className="card bg-slate-50 border-slate-100 p-8 group cursor-default hover:bg-white hover:border-primary/20"
                            >
                                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl mb-6 border border-slate-100 shadow-sm group-hover:scale-110 transition-transform">{feature.icon}</div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed text-sm font-medium">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-primary/30"
                    >
                        <div className="absolute top-0 right-0 w-96 h-96 bg-accent opacity-20 rounded-full blur-[100px] -mr-20 -mt-20 animate-pulse-slow"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary opacity-30 rounded-full blur-3xl -ml-20 -mb-20"></div>

                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">Ready to modernize your operations?</h2>
                        <p className="text-indigo-100 max-w-2xl mx-auto mb-10 relative z-10 text-lg">
                            Join hundreds of medical professionals who trust our platform for their daily management.
                        </p>
                        <div className="flex justify-center gap-4 relative z-10">
                            <Link to="/register">
                                <Button className="bg-white text-primary hover:bg-indigo-50 font-bold px-8 py-3 rounded-xl shadow-lg border-2 border-transparent hover:-translate-y-1 transition-transform">
                                    Create Free Account
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-2">
                        <h4 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded bg-primary"></span> MediBook
                        </h4>
                        <p className="max-w-xs text-sm">
                            Empowering healthcare providers with cutting-edge technology for better patient outcomes.
                        </p>
                    </div>
                    <div>
                        <h5 className="text-white font-bold mb-4">Platform</h5>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/services" className="hover:text-primary">Find Doctors</Link></li>
                            <li><Link to="/login" className="hover:text-primary">Doctor Login</Link></li>
                            <li><Link to="/admin/login" className="hover:text-primary">Admin Portal</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-white font-bold mb-4">Legal</h5>
                        <ul className="space-y-2 text-sm">
                            <li><span className="cursor-pointer hover:text-primary">Privacy Policy</span></li>
                            <li><span className="cursor-pointer hover:text-primary">Terms of Service</span></li>
                        </ul>
                    </div>
                </div>
                <div className="container mx-auto px-4 text-center text-xs border-t border-slate-800 pt-8">
                    &copy; {new Date().getFullYear()} MediBook Healthcare Platform. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Home;
