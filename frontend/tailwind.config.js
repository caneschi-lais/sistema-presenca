/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    // Força o tema geoclass a ser o único e o padrão
    themes: [
      {
        geoclass: {
          "primary": "#0056b3",      // Azul da Logo (Geo)
          "primary-content": "#ffffff",

          "secondary": "#00a96e",    // Verde da Logo (Class)
          "secondary-content": "#ffffff",

          "accent": "#00c4cc",       // Ciano para detalhes
          "neutral": "#2a323c",      // Cinza escuro
          "base-100": "#ffffff",     // Fundo branco
          "base-200": "#f3f4f6",     // Fundo cinza claro
          
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",        // Vermelho (Alertas)
        },
      },
    ],
    // Desativa temas padrões para evitar que o rosa volte
    darkTheme: "geoclass", 
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
    themeRoot: ":root",
  },
}