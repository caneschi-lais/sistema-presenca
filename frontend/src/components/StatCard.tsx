import { ReactNode } from 'react';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: ReactNode;
    color?: 'primary' | 'secondary' | 'accent' | 'error' | 'info' | 'success' | 'warning';
    onClick?: () => void;
}

export default function StatCard({ title, value, icon, color = 'primary', onClick }: StatCardProps) {
    // Mapeamento de cores seguro para o Tailwind CSS
    const colorStyles = {
        primary: { border: 'border-primary', text: 'text-primary', bg: 'bg-primary/10' },
        secondary: { border: 'border-secondary', text: 'text-secondary', bg: 'bg-secondary/10' },
        accent: { border: 'border-accent', text: 'text-accent', bg: 'bg-accent/10' },
        error: { border: 'border-error', text: 'text-error', bg: 'bg-error/10' },
        info: { border: 'border-info', text: 'text-info', bg: 'bg-info/10' },
        success: { border: 'border-success', text: 'text-success', bg: 'bg-success/10' },
        warning: { border: 'border-warning', text: 'text-warning', bg: 'bg-warning/10' },
    };

    const styles = colorStyles[color];

    return (
        <div
            onClick={onClick}
            className={`card bg-base-100 shadow-sm border-l-4 ${styles.border} ${onClick ? 'cursor-pointer hover:bg-base-200 hover:shadow-md transition-all' : ''}`}
        >
            <div className="card-body p-6 flex flex-row items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
                    <p className={`text-3xl font-bold mt-1 ${color === 'error' ? 'text-error' : 'text-base-content'}`}>
                        {value}
                    </p>
                </div>
                <div className={`${styles.bg} p-3 rounded-xl ${styles.text}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}