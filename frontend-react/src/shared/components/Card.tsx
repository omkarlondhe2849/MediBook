import React, { type ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    title?: string;
    subtitle?: string;
    footer?: ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle, footer }) => {
    return (
        <div className={`card ${className}`}>
            {(title || subtitle) && (
                <div className="mb-4">
                    {title && <h3 className="text-xl font-bold mb-1">{title}</h3>}
                    {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
                </div>
            )}
            <div className="card-content">
                {children}
            </div>
            {footer && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default Card;
