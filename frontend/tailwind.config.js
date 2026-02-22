/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                earth: {
                    50: '#fdf8f0',
                    100: '#f9f3e8',
                    200: '#f0e0c0',
                    300: '#dfc090',
                    400: '#c99a60',
                    500: '#b07840',
                    600: '#8a5a28',
                    700: '#6b4118',
                    800: '#4d2d0e',
                    900: '#2d1a07',
                },
                leaf: {
                    50: '#f0faf0',
                    100: '#dcf5dc',
                    200: '#b0e8b0',
                    300: '#78d078',
                    400: '#4ab84a',
                    500: '#2e8b2e',
                    600: '#1f6b1f',
                    700: '#165016',
                    800: '#0e360e',
                    900: '#071e07',
                }
            },
            fontFamily: {
                mukta: ['Mukta', 'sans-serif'],
                inter: ['Inter', 'sans-serif'],
            },
            backgroundImage: {
                'rural-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23b07840' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }
        },
    },
    plugins: [],
}
