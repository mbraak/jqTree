module.exports = {
    content: [
        "./_layouts/**/*.html",
        "./index.html",
        "./_examples/**/*.html",
        "./static/examples/*.js",
    ],
    theme: {
        extend: {
            maxWidth: {
                "8xl": "90rem",
            },
        },
    },
    plugins: [require("@tailwindcss/typography")],
};
