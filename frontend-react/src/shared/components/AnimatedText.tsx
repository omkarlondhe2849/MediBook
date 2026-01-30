import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedTextProps {
    text: string;
    className?: string;
    type?: 'fade' | 'typewriter' | 'slide-up';
    delay?: number;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({ text, className = '', type = 'fade', delay = 0 }) => {
    // Word splitting for typewriter/stagger effects
    const words = text.split(" ");

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.04, delayChildren: 0.04 * i + delay },
        }),
    };

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring" as const,
                damping: 20,
                stiffness: 200,
            },
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                type: "spring" as const,
                damping: 20,
                stiffness: 200,
            },
        },
    };

    if (type === 'typewriter') {
        return (
            <motion.div
                style={{ overflow: 'hidden', display: 'flex', flexWrap: 'wrap' }}
                variants={container}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={className}
            >
                {words.map((word, index) => (
                    <motion.span variants={child} style={{ marginRight: "0.25em" }} key={index}>
                        {word}
                    </motion.span>
                ))}
            </motion.div>
        );
    }

    // Simple Fade/Slide
    return (
        <motion.div
            initial={{ opacity: 0, y: type === 'slide-up' ? 20 : 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay, ease: "easeOut" }}
            className={className}
        >
            {text}
        </motion.div>
    );
};

export default AnimatedText;
