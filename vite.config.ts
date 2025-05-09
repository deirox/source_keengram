import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import legacy from "@vitejs/plugin-legacy";
import tsconfigPaths from "vite-tsconfig-paths";
import * as path from "path";
// import autoprefixer from "autoprefixer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    legacy({
      targets: [
        "defaults",
        "not dead",
        "not op_mini all",
        "not IE 11",
        "last 10 versions and not dead, > 0.3%, Firefox ESR",
        "iOS 7",
      ],
    }),
  ],
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
  },
  // css: {
  //   postcss: {
  //     plugins: [
  //       autoprefixer({}), // add options if needed
  //     ],
  //   },
  // },
});
