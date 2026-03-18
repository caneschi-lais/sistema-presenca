import { ReactNode } from 'react';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: ReactNode; // Permite passar qualquer ícone do Lucide
  className?: string;
}

export default function EmptyState({
  title,
  message,
  icon = <SearchX size={40} />, // Ícone padrão caso nenhum seja passado
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center opacity-70 ${className}`}>
      <div className="mb-3 text-gray-400">
        {icon}
      </div>
      {title && <h3 className="text-lg font-bold text-gray-600 mb-1">{title}</h3>}
      <p className="text-sm text-gray-500 max-w-sm">{message}</p>
    </div>
  );
}