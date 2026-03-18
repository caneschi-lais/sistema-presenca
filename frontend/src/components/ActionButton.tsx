import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface ActionButtonProps {
  title: string;
  description?: string; // Se passar descrição, ele vira um botão de menu (estilo Coordenador)
  icon?: ReactNode;     // Ícone opcional
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'error';
  fullWidth?: boolean;
  className?: string;
  showChevron?: boolean; // Mostra a setinha para a direita
  disabled?: boolean;
}

export default function ActionButton({
  title,
  description,
  icon,
  onClick,
  variant = 'primary',
  fullWidth = true,
  className = '',
  showChevron = false,
  disabled = false,
}: ActionButtonProps) {

  // Define a classe da cor baseado na propriedade "variant"
  const variantClass = variant === 'outline' ? 'btn-outline' : `btn-${variant}`;
  const widthClass = fullWidth ? 'w-full' : '';

  // CENÁRIO 1: Botão com Descrição (Estilo Ações Rápidas do Coordenador)
  if (description) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`btn ${variantClass} ${widthClass} justify-between h-auto py-3 ${className}`}
      >
        <div className="flex items-center gap-3 text-left">
          {icon && <div className="opacity-80">{icon}</div>}
          <div className="flex flex-col items-start gap-1">
            <span className="font-bold">{title}</span>
            <span className="text-xs opacity-70 font-normal">{description}</span>
          </div>
        </div>
        {showChevron && <ChevronRight size={18} className="opacity-70" />}
      </button>
    );
  }

  // CENÁRIO 2: Botão Simples (Estilo "Marcar Presença" do Aluno)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn ${variantClass} ${widthClass} shadow-md ${className}`}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {title}
      {showChevron && <ChevronRight size={18} className="ml-1" />}
    </button>
  );
}