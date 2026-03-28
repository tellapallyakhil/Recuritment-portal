'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { StudentLoginForm } from '@/components/student-login-form';

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        }>
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-sans">
                {/* Mesh Gradient Background */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[150px] rounded-full"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[150px] rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-blue-500/10 blur-[120px] rounded-full"></div>
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:32px_32px]"></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="w-full max-w-[480px] relative z-10"
                >
                    {/* Branding Above Card */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-3 mb-6">
                            <div className="bg-white p-1 rounded-2xl shadow-2xl shadow-blue-500/20 overflow-hidden w-14 h-14 flex items-center justify-center">
                                <img src="/logo.jpg" alt="KLU Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-white">
                                KLU <span className="text-blue-500">Recruitment</span>
                            </span>
                        </div>
                    </div>

                    <StudentLoginForm />

                    <p className="text-center text-slate-500 text-sm mt-10 font-medium">
                        Faculty? <a href="/faculty/login" className="text-blue-500 hover:text-blue-400 font-bold ml-1 transition-colors">Access Faculty Portal →</a>
                    </p>
                    <div className="mt-20 text-center opacity-20 pointer-events-none grayscale">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white">KLU Global Campus Protocol</p>
                    </div>
                </motion.div>
            </div>
        </Suspense>
    );
}
