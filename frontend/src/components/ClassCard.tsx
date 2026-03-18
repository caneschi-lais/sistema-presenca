import { ReactNode } from 'react';

interface ClassCardProps {
  title: string;
  topBadge?: ReactNode; // Opcional (O professor usa para o dia da semana)
  children: ReactNode;  // As informações do meio do cartão
  actions: ReactNode;   // Os botões de ação do rodapé
}

export default function ClassCard({ title, topBadge, children, actions }: ClassCardProps) {
  return (
    <div className="card bg-base-100 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 h-full flex flex-col">
      <div className="card-body p-6 flex flex-col flex-grow">
        
        {/* Badge do Topo (Opcional) */}
        {topBadge && (
          <div className="flex justify-between items-start mb-1">
            {topBadge}
          </div>
        )}
        
        {/* Título da Matéria */}
        <h3 className="card-title text-xl text-primary">{title}</h3>
        
        <div className="divider my-0"></div>
        
        {/* Conteúdo Dinâmico (Aqui entram as presenças ou os horários) */}
        <div className="flex-grow text-sm text-gray-600 my-2">
          {children}
        </div>

        {/* Rodapé com os Botões */}
        <div className="card-actions justify-end mt-4 flex-col gap-2 w-full">
          {actions}
        </div>
        
      </div>
    </div>
  );
}