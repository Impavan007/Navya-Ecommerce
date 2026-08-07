'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col items-center justify-center p-12 text-center"
        >
            <div className="relative mb-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: 'spring',
                        stiffness: 260,
                        damping: 20,
                        delay: 0.2
                    }}
                    className="w-24 h-24 bg-[#F3D6DC] rounded-full flex items-center justify-center"
                >
                    <Icon className="w-10 h-10 text-[#3D1126] opacity-60" />
                </motion.div>

                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-[#F3D6DC] rounded-full -z-10"
                />
            </div>

            <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-serif font-bold text-[#3D1126] mb-3"
            >
                {title}
            </motion.h3>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-[#6D6D6D] max-w-sm mx-auto mb-8 font-playfair leading-relaxed"
            >
                {description}
            </motion.p>

            {action && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={action.onClick}
                    className="bg-[#1A1A1A] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-[#1A1A1A] transition-colors shadow-lg shadow-gray-200"
                >
                    {action.label}
                </motion.button>
            )}
        </motion.div>
    );
}
