import React, { type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'text';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading,
    fullWidth,
    className = '',
    disabled,
    ...props
}) => {

    const baseClass = 'btn relative overflow-hidden';
    const variantClass = variant === 'primary' ? 'btn-primary' : variant === 'outline' ? 'btn-outline' : variant === 'text' ? 'btn-text' : '';
    const sizeClass = size === 'sm' ? 'px-3 py-1 text-sm' : size === 'lg' ? 'px-8 py-4 text-lg' : '';

    const widthClass = fullWidth ? 'w-full' : '';
    const loadingClass = isLoading ? 'opacity-70 cursor-not-allowed' : '';

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${loadingClass} ${className}`}
            disabled={disabled || isLoading}
            {...props as any}
        >
            {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    <span>Loading...</span>
                </div>
            ) : children}
        </motion.button>
    );
};

export default Button;
