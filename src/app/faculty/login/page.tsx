'use client';

import { FacultyLoginForm } from '@/components/faculty-login-form';
import { motion } from 'framer-motion';

export default function FacultyLoginPage() {
    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Emerald Mesh Gradient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-600/10 blur-[150px] rounded-full"></div>
                <div className="absolute top-1/3 right-1/4 w-[30%] h-[30%] bg-emerald-500/5 blur-[120px] rounded-full"></div>
                {/* Textures */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] brightness-100 contrast-150"></div>
                <div className="absolute inset-0 bg-grid-white/[0.01] bg-[length:40px_40px]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="w-full max-w-[480px] relative z-10"
            >
                {/* Branding */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-3 mb-6">
                        <div className="bg-white p-1 rounded-2xl shadow-2xl shadow-emerald-500/20 overflow-hidden w-14 h-14 flex items-center justify-center">
                            <img src="/logo.jpg" alt="KLU Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-white">
                            KLU <span className="text-emerald-500 tracking-normal uppercase text-sm font-bold ml-1">Faculty Portal</span>
                        </span>
                    </div>
                </div>

                <FacultyLoginForm />

                <div className="text-center mt-10">
                    <p className="text-slate-500 text-sm font-medium">
                        Student? <a href="/login" className="text-emerald-500 hover:text-emerald-400 font-bold ml-1 transition-colors">Access Student Portal →</a>
                    </p>
                </div>

                <div className="mt-20 text-center opacity-10 pointer-events-none grayscale">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white">KLU Administrative Framework v4.0</p>
                </div>
            </motion.div>
        </div>
    );
}
