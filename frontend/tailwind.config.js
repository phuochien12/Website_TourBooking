/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0d9488',   // Teal
                secondary: '#f43f5e', // Coral
                accent: '#c9a96e',    // Gold
                navy: '#1e3a5f',      // Navy
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
                'bounce-slow': 'bounceSlow 3s infinite',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                bounceSlow: {
                    '0%, 100%': { transform: 'translateY(-5%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
                    '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
                }
            }
        },
    },
    plugins: [],
}
