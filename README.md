# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

```
supreme-tech-new
├─ .env
├─ README.md
├─ assets
│  ├─ ai-background-hero.jpg
│  ├─ ai-face-hero.jpg
│  ├─ ai-hero-new.webp
│  ├─ ai-hero.jpg
│  ├─ ai-robot-hero.jpg
│  ├─ blog-ai-agent-what-is-it.jpg
│  ├─ blog-ai-agents-productivity.jpg
│  ├─ blog-elecyar-ai-agent.jpg
│  ├─ blog-ram-price-ai.jpg
│  ├─ favicon-96x96.png
│  ├─ favicon.svg
│  ├─ partners
│  │  └─ iau-svgrepo-com.svg
│  ├─ service-analytics-cyber.jpg
│  ├─ service-analytics.jpg
│  ├─ service-business-cyber.jpg
│  ├─ service-business.jpg
│  ├─ service-creative-cyber.jpg
│  ├─ service-creative.jpg
│  ├─ slide-analytics.jpg
│  ├─ slide-consultation.jpg
│  ├─ slide-content-creation.jpg
│  ├─ slide-lumen-ai-final.jpg
│  ├─ slide-lumen-ai-new.jpg
│  ├─ slide-lumen-ai-themed.jpg
│  ├─ slide-lumen-ai-updated.jpg
│  ├─ slide-lumen-ai.jpg
│  ├─ slide-time-saving-new.jpg
│  ├─ slide-time-saving-updated.jpg
│  └─ slide-time-saving.jpg
├─ favicon
│  ├─ apple-touch-icon.png
│  ├─ favicon-96x96.png
│  ├─ favicon.ico
│  ├─ favicon.svg
│  ├─ site.webmanifest
│  ├─ web-app-manifest-192x192.png
│  └─ web-app-manifest-512x512.png
├─ favicon_io
│  ├─ android-chrome-192x192.png
│  ├─ android-chrome-512x512.png
│  ├─ apple-touch-icon.png
│  ├─ favicon-16x16.png
│  ├─ favicon-32x32.png
│  ├─ favicon.ico
│  └─ site.webmanifest
├─ index.html
├─ lib
│  └─ utils.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ prisma
│  ├─ migrations
│  │  ├─ 20260720205038_fix_phone_field_type
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
│  └─ schema.prisma
├─ public
│  ├─ favicon
│  │  ├─ apple-touch-icon.png
│  │  ├─ favicon-96x96.png
│  │  ├─ favicon.ico
│  │  ├─ favicon.svg
│  │  ├─ site.webmanifest
│  │  ├─ web-app-manifest-192x192.png
│  │  └─ web-app-manifest-512x512.png
│  ├─ favicon.ico
│  ├─ partners
│  ├─ slides
│  └─ team
├─ server
│  ├─ lib
│  ├─ middleware
│  └─ routes
├─ src
│  ├─ App.tsx
│  ├─ components
│  │  ├─ admin
│  │  ├─ layout
│  │  │  ├─ Footer.tsx
│  │  │  ├─ Header.tsx
│  │  │  └─ Layout.tsx
│  │  ├─ sections
│  │  │  ├─ Approach.tsx
│  │  │  ├─ Contact.tsx
│  │  │  ├─ Footer.tsx
│  │  │  ├─ Hero.tsx
│  │  │  ├─ Partners.tsx
│  │  │  └─ Services.tsx
│  │  └─ ui
│  │     ├─ GlassButton.tsx
│  │     ├─ LiquidGlassCard.tsx
│  │     └─ liquid-glass.tsx
│  ├─ constants
│  │  ├─ data.ts
│  │  └─ slides.ts
│  ├─ hooks
│  ├─ index.css
│  ├─ lib
│  │  ├─ api
│  │  ├─ db
│  │  └─ utils.ts
│  ├─ main.tsx
│  ├─ pages
│  │  ├─ About.tsx
│  │  ├─ Admin.tsx
│  │  ├─ Blog.tsx
│  │  ├─ Contact.tsx
│  │  ├─ Home.tsx
│  │  ├─ Services.tsx
│  │  ├─ admin
│  │  └─ public
│  ├─ types
│  │  └─ index.ts
│  └─ utils
├─ supreme-tech-backend
│  ├─ .env
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ prisma
│  │  └─ schema.prisma
│  ├─ server.js
│  └─ src
│     ├─ app.js
│     ├─ controllers
│     │  ├─ admin.controller.js
│     │  ├─ blog.controller.js
│     │  ├─ enrollment.controller.js
│     │  └─ event.controller.js
│     ├─ middleware
│     │  ├─ auth.js
│     │  └─ errorHandler.js
│     ├─ routes
│     │  ├─ admin.routes.js
│     │  ├─ blog.routes.js
│     │  ├─ enrollment.routes.js
│     │  ├─ event.routes.js
│     │  ├─ hero.routes.js
│     │  ├─ partner.routes.js
│     │  ├─ stats.routes.js
│     │  └─ team.routes.js
│     └─ utils
│        └─ prisma.js
├─ tailwind.config.js
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts

```