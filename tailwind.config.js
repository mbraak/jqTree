module.exports = {
    content: ["./_layouts/**/*.html", "./index.html", "./_examples/**/*.html"],
    theme: {
        extend: {},
    },
    plugins: [require("@tailwindcss/typography")],
};
