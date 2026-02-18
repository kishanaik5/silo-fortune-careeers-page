/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'silo-green': '#2E7D32',
                'silo-gold': '#FFD700',
            }
        },
    },
    plugins: [],
}
