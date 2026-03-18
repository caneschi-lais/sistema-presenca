import { ReactNode } from 'react';

interface StatusBadgeProps {
    text: string;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'ghost';
    icon?: ReactNode;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function StatusBadge({
    text,
    variant = 'neutral',
    icon,
    size = 'md',
    className = ''
}: StatusBadgeProps) {

    // Monta as classes do DaisyUI baseadas nas propriedades
    const variantClass = variant === 'ghost' ? 'badge-ghost' : `badge-${variant}`;
    const sizeClass = size === 'md' ? '' : `badge-${size}`;

    // Para cores fortes (success, error, info), forçamos o texto a branco para melhor contraste
    const textClass = (variant === 'success' || variant === 'error' || variant === 'info')
        ? 'text-white font-bold'
        : 'font-medium';

    return (
        <span className={`badge ${variantClass} ${sizeClass} gap-1 border-none ${textClass} shadow-sm ${className}`}>
            {icon}
            {text}
        </span>
    );
}