import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Badge = ({ children, variant = 'gray', className }) => {
    const variants = {
        primary: 'bg-primary/10 text-primary-dark border-primary/20',
        accent: 'bg-accent/10 text-accent border-accent/20',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        warning: 'bg-amber-50 text-amber-700 border-amber-100',
        danger: 'bg-rose-50 text-rose-700 border-rose-100',
        gray: 'bg-gray-50 text-gray-700 border-gray-200',
    };

    return (
        <span className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-bold border",
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
};

export default Badge;
