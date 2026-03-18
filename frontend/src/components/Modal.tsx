import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: ReactNode;      // Título do Modal (aceita texto e ícones)
    children: ReactNode;   // O conteúdo da janela (Tabelas, formulários, etc)
    maxWidth?: string;     // Largura máxima (ex: 'max-w-3xl', 'max-w-5xl')
    headerColor?: 'primary' | 'secondary' | 'accent' | 'error' | 'neutral' | 'transparent';
    headerAction?: ReactNode; // Para colocar botões extras no cabeçalho (ex: botão de atualizar)
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'max-w-3xl',
    headerColor = 'primary',
    headerAction
}: ModalProps) {

    if (!isOpen) return null;

    // Mapeamento de cores seguro para o Tailwind (evita que a cor suma no build de produção)
    const colorClasses = {
        primary: 'bg-primary text-primary-content',
        secondary: 'bg-secondary text-secondary-content',
        accent: 'bg-accent text-accent-content',
        error: 'bg-error text-error-content',
        neutral: 'bg-neutral text-neutral-content',
        transparent: 'bg-transparent text-base-content border-b border-base-200'
    };

    const headerClass = colorClasses[headerColor];

    return (
        <div className="modal modal-open bg-black/60 backdrop-blur-sm z-50">
            <div className={`modal-box w-11/12 ${maxWidth} p-0 overflow-hidden flex flex-col max-h-[90vh]`}>

                {/* CABEÇALHO PADRONIZADO */}
                <div className={`${headerClass} p-4 flex justify-between items-center shrink-0`}>
                    <div className="font-bold text-lg flex items-center gap-2">
                        {title}
                    </div>
                    <div className="flex items-center gap-2">
                        {headerAction}
                        <button
                            className={`btn btn-ghost btn-circle hover:bg-black/20 ${headerColor === 'transparent' ? 'text-base-content' : 'text-white'}`}
                            onClick={onClose}
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* CORPO DO MODAL (Conteúdo com scroll) */}
                <div className="p-6 bg-base-100 overflow-y-auto flex-grow">
                    {children}
                </div>

            </div>
        </div>
    );
}