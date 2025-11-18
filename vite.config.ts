import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
    base: "/8-bit-Studio/",
    plugins: [tailwindcss()],
    resolve: {
        alias: {
            "@": fileURLToPath(
                new URL("./src", import.meta.url)
            ),
        },
    },
});
