import React, { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', id, ...props }) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className={`input-group ${className}`}>
            <label htmlFor={inputId} className="input-label">
                {label}
            </label>
            <input
                id={inputId}
                className={`input-field ${error ? 'border-red-500' : ''}`}
                {...props}
            />
            {error && <span className="text-sm text-red-500 mt-1">{error}</span>}
        </div>
    );
};

export default Input;
