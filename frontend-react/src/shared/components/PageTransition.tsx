import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
    children: React.ReactNode;
    className?: string;
}

const variants = {
    initial: { opacity: 0, x: 20, filter: 'blur(5px)' },
    animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, x: -20, filter: 'blur(5px)' }
};

const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
            }}
            className={`w-full h-full ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
