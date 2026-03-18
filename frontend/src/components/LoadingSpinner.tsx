interface LoadingSpinnerProps {
  fullScreen?: boolean; // Se for true, ocupa o ecrã/espaço todo para centralizar
  size?: 'xs' | 'sm' | 'md' | 'lg'; // Tamanho da rodinha
  color?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'info'; // Cor da rodinha
  text?: string; // Texto opcional por baixo
}

export default function LoadingSpinner({
  fullScreen = true,
  size = 'lg',
  color = 'primary',
  text
}: LoadingSpinnerProps) {

  // Define se vai ocupar uma altura grande (para o centro da página) ou apenas um bloco pequeno
  const containerClasses = fullScreen
    ? "flex flex-col items-center justify-center min-h-[60vh] w-full"
    : "flex flex-col items-center justify-center py-8 w-full";

  return (
    <div className={containerClasses}>
      <span className={`loading loading-spinner loading-${size} text-${color}`}></span>
      {text && (
        <p className="mt-4 text-gray-500 font-medium animate-pulse">{text}</p>
      )}
    </div>
  );
}