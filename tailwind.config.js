module.exports = {
    content: ["./_layouts/**/*.html", "./index.html", "./_examples/**/*.html"],
    theme: {
        extend: {
            maxWidth: {
                "8xl": "90rem",
            },
        },
    },
    plugins: [require("@tailwindcss/typography")],
};
