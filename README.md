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

```
supreme-tech-new
├─ README.md
├─ convert-api.sh
├─ index.html
├─ lib
│  └─ utils.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ public
│  ├─ assets
│  │  ├─ ai-background-hero.webp
│  │  ├─ ai-face-hero.webp
│  │  ├─ ai-hero-new.webp
│  │  ├─ ai-hero.webp
│  │  ├─ ai-robot-hero.webp
│  │  ├─ blog-ai-agent-what-is-it.webp
│  │  ├─ blog-ai-agents-productivity.webp
│  │  ├─ blog-elecyar-ai-agent.webp
│  │  ├─ blog-ram-price-ai.webp
│  │  ├─ favicon-96x96.webp
│  │  ├─ service-analytics-cyber.webp
│  │  ├─ service-analytics.webp
│  │  ├─ service-business-cyber.webp
│  │  ├─ service-business.webp
│  │  ├─ service-creative-cyber.webp
│  │  ├─ service-creative.webp
│  │  ├─ slide-analytics.webp
│  │  ├─ slide-consultation.webp
│  │  ├─ slide-content-creation.webp
│  │  ├─ slide-lumen-ai-final.webp
│  │  ├─ slide-lumen-ai-new.webp
│  │  ├─ slide-lumen-ai-themed.webp
│  │  ├─ slide-lumen-ai-updated.webp
│  │  ├─ slide-lumen-ai.webp
│  │  ├─ slide-time-saving-new.webp
│  │  ├─ slide-time-saving-updated.webp
│  │  ├─ slide-time-saving.webp
│  │  └─ slides
│  │     ├─ ai-background-hero.webp
│  │     ├─ ai-face-hero.webp
│  │     ├─ ai-hero-new.webp
│  │     ├─ ai-hero.webp
│  │     ├─ ai-robot-hero.webp
│  │     ├─ blog-ai-agent-what-is-it.webp
│  │     ├─ blog-ai-agents-productivity.webp
│  │     ├─ blog-elecyar-ai-agent.webp
│  │     ├─ blog-ram-price-ai.webp
│  │     ├─ favicon-96x96.webp
│  │     ├─ favicon.svg
│  │     ├─ service-analytics-cyber.webp
│  │     ├─ service-analytics.webp
│  │     ├─ service-business-cyber.webp
│  │     ├─ service-business.webp
│  │     ├─ service-creative-cyber.webp
│  │     ├─ service-creative.webp
│  │     ├─ slide-analytics.webp
│  │     ├─ slide-consultation.webp
│  │     ├─ slide-content-creation.webp
│  │     ├─ slide-lumen-ai-final.webp
│  │     ├─ slide-lumen-ai-new.webp
│  │     ├─ slide-lumen-ai-themed.webp
│  │     ├─ slide-lumen-ai-updated.webp
│  │     ├─ slide-lumen-ai.webp
│  │     ├─ slide-time-saving-new.webp
│  │     ├─ slide-time-saving-updated.webp
│  │     └─ slide-time-saving.webp
│  ├─ favicon
│  │  ├─ apple-touch-icon.png
│  │  ├─ favicon-96x96.png
│  │  ├─ favicon.ico
│  │  ├─ favicon.svg
│  │  ├─ site.webmanifest
│  │  ├─ web-app-manifest-192x192.png
│  │  └─ web-app-manifest-512x512.png
│  ├─ favicon.ico
│  └─ slides
│     ├─ ai-background-hero.webp
│     ├─ ai-face-hero.webp
│     ├─ ai-hero-new.webp
│     ├─ ai-hero.webp
│     ├─ ai-robot-hero.webp
│     ├─ blog-ai-agent-what-is-it.webp
│     ├─ blog-ai-agents-productivity.webp
│     ├─ blog-elecyar-ai-agent.webp
│     ├─ blog-ram-price-ai.webp
│     ├─ favicon-96x96.webp
│     ├─ favicon.svg
│     ├─ service-analytics-cyber.webp
│     ├─ service-analytics.webp
│     ├─ service-business-cyber.webp
│     ├─ service-business.webp
│     ├─ service-creative-cyber.webp
│     ├─ service-creative.webp
│     ├─ slide-analytics.webp
│     ├─ slide-consultation.webp
│     ├─ slide-content-creation.webp
│     ├─ slide-lumen-ai-final.webp
│     ├─ slide-lumen-ai-new.webp
│     ├─ slide-lumen-ai-themed.webp
│     ├─ slide-lumen-ai-updated.webp
│     ├─ slide-lumen-ai.webp
│     ├─ slide-time-saving-new.webp
│     ├─ slide-time-saving-updated.webp
│     └─ slide-time-saving.webp
├─ src
│  ├─ App.tsx
│  ├─ components
│  │  ├─ Cart
│  │  │  ├─ CartItem.tsx
│  │  │  ├─ CartSummary.tsx
│  │  │  ├─ CartTab.tsx
│  │  │  ├─ CouponInput.tsx
│  │  │  └─ EmptyCart.tsx
│  │  ├─ SEO
│  │  │  └─ MetaTags.tsx
│  │  ├─ ScrollToTop.tsx
│  │  ├─ admin
│  │  │  ├─ AdminLayout.tsx
│  │  │  ├─ BlogEditor.tsx
│  │  │  ├─ DailyChartRecharts.tsx
│  │  │  ├─ Messages
│  │  │  │  └─ MessageList.tsx
│  │  │  ├─ PaymentDetailsModal.tsx
│  │  │  └─ Tickets
│  │  │     ├─ TicketCreate.tsx
│  │  │     ├─ TicketGroupCreate.tsx
│  │  │     └─ TicketList.tsx
│  │  ├─ auth
│  │  │  └─ ProtectedRoute.tsx
│  │  ├─ course
│  │  │  └─ CoursePreRegisterModal.tsx
│  │  ├─ payment
│  │  │  ├─ BalePayment.tsx
│  │  │  ├─ CardToCardPayment.tsx
│  │  │  ├─ PaymentMethodModal.tsx
│  │  │  └─ PaymentModal.tsx
│  │  ├─ profile
│  │  │  ├─ CartTab.tsx
│  │  │  ├─ EnrollmentsTab.tsx
│  │  │  ├─ PaymentModal.tsx
│  │  │  ├─ ProfileHeader.tsx
│  │  │  ├─ ProfileInfo.tsx
│  │  │  ├─ ProfileStats.tsx
│  │  │  ├─ ProfileTabs.tsx
│  │  │  ├─ TicketsTab.tsx
│  │  │  └─ index.ts
│  │  ├─ sections
│  │  │  ├─ Approach.tsx
│  │  │  ├─ Contact.tsx
│  │  │  ├─ CourseList.tsx
│  │  │  ├─ EmployeesSection.tsx
│  │  │  ├─ Footer.tsx
│  │  │  ├─ Hero.tsx
│  │  │  ├─ HeroStats.tsx
│  │  │  ├─ Partners.tsx
│  │  │  └─ Services.tsx
│  │  ├─ skeletons
│  │  │  ├─ AdminListSkeleton.tsx
│  │  │  ├─ BlogListSkeleton.tsx
│  │  │  ├─ BlogPostSkeleton.tsx
│  │  │  ├─ DashboardSkeleton.tsx
│  │  │  ├─ EventDetailSkeleton.tsx
│  │  │  ├─ EventSkeletons.tsx
│  │  │  └─ LoadingSkeleton.tsx
│  │  └─ ui
│  │     ├─ BankCard.tsx
│  │     ├─ Button.tsx
│  │     ├─ Card.tsx
│  │     ├─ CountdownTimer.tsx
│  │     ├─ GlassBirthdayPicker.tsx
│  │     ├─ GlassButton.tsx
│  │     ├─ ImageUpload.tsx
│  │     ├─ Input.tsx
│  │     ├─ LikeButton.tsx
│  │     ├─ LiquidGlassCard.tsx
│  │     ├─ LiquidToast.tsx
│  │     ├─ OptimizedImage.tsx
│  │     ├─ PersianDatePicker.tsx
│  │     ├─ SafeImage.tsx
│  │     ├─ SectionHeader.tsx
│  │     ├─ ShareButton.tsx
│  │     ├─ Toaster.tsx
│  │     ├─ confirm-toast.tsx
│  │     └─ sonner-provider.tsx
│  ├─ constants
│  │  ├─ blog.ts
│  │  ├─ data.ts
│  │  ├─ index.ts
│  │  ├─ partners.ts
│  │  └─ slides.ts
│  ├─ contexts
│  │  └─ SettingsContext.tsx
│  ├─ hooks
│  │  ├─ use-toast.tsx
│  │  ├─ useCart.ts
│  │  └─ useCoursePreRegister.ts
│  ├─ index.css
│  ├─ lib
│  │  ├─ api
│  │  │  ├─ admin.ts
│  │  │  ├─ auth.ts
│  │  │  ├─ axios.ts
│  │  │  ├─ blog.ts
│  │  │  ├─ cart.ts
│  │  │  ├─ client.ts
│  │  │  ├─ coupons.ts
│  │  │  ├─ courses.ts
│  │  │  ├─ employees.ts
│  │  │  ├─ enrollments.ts
│  │  │  ├─ events.ts
│  │  │  ├─ hero.ts
│  │  │  ├─ index.ts
│  │  │  ├─ messages.ts
│  │  │  ├─ partners.ts
│  │  │  ├─ payment.ts
│  │  │  ├─ settings.ts
│  │  │  ├─ stats.ts
│  │  │  ├─ team.ts
│  │  │  ├─ tickets.ts
│  │  │  ├─ upload.ts
│  │  │  └─ users.ts
│  │  ├─ constants.ts
│  │  └─ utils.ts
│  ├─ main.tsx
│  ├─ pages
│  │  ├─ About.tsx
│  │  ├─ AccessDenied.tsx
│  │  ├─ Approach.tsx
│  │  ├─ Cart.tsx
│  │  ├─ Contact.tsx
│  │  ├─ Home.tsx
│  │  ├─ NotFound.tsx
│  │  ├─ Profile
│  │  │  └─ Profile.tsx
│  │  ├─ Services.tsx
│  │  ├─ TicketCreate.tsx
│  │  ├─ TicketDetail.tsx
│  │  ├─ admin
│  │  │  ├─ Blog
│  │  │  │  ├─ BlogCreate.tsx
│  │  │  │  ├─ BlogEdit.tsx
│  │  │  │  └─ BlogList.tsx
│  │  │  ├─ Copuns
│  │  │  │  └─ CouponsManager.tsx
│  │  │  ├─ Courses
│  │  │  │  ├─ CourseCreate.tsx
│  │  │  │  ├─ CourseEdit.tsx
│  │  │  │  ├─ CourseEnrollments.tsx
│  │  │  │  └─ CourseList.tsx
│  │  │  ├─ Dashboard.tsx
│  │  │  ├─ Dashboard.tsx.backup
│  │  │  ├─ Employees
│  │  │  │  ├─ EmployeeCreate.tsx
│  │  │  │  ├─ EmployeeEdit.tsx
│  │  │  │  └─ EmployeeList.tsx
│  │  │  ├─ Events
│  │  │  │  ├─ EventCreate.tsx
│  │  │  │  ├─ EventEdit.tsx
│  │  │  │  ├─ EventEnrollments.tsx
│  │  │  │  └─ EventList.tsx
│  │  │  ├─ Help.tsx
│  │  │  ├─ Hero
│  │  │  │  ├─ HeroCreate.tsx
│  │  │  │  ├─ HeroEdit.tsx
│  │  │  │  └─ HeroList.tsx
│  │  │  ├─ Login.tsx
│  │  │  ├─ Partners
│  │  │  │  ├─ PartnerCreate.tsx
│  │  │  │  ├─ PartnerEdite.tsx
│  │  │  │  └─ PartnersList.tsx
│  │  │  ├─ Payments
│  │  │  │  └─ OrdersList.tsx
│  │  │  ├─ Profile.tsx
│  │  │  ├─ Settings
│  │  │  │  └─ Settings.tsx
│  │  │  ├─ Stats.tsx
│  │  │  ├─ Team
│  │  │  │  └─ TeamList.tsx
│  │  │  └─ Users
│  │  │     └─ UserList.tsx
│  │  ├─ auth
│  │  │  ├─ ForgotPassword.tsx
│  │  │  ├─ Login.tsx
│  │  │  └─ Register.tsx
│  │  └─ public
│  │     ├─ BlogList.tsx
│  │     ├─ BlogPost.tsx
│  │     ├─ CourseDetail.tsx
│  │     ├─ EventDetail.tsx
│  │     └─ Events.tsx
│  └─ types
│     ├─ cart.ts
│     ├─ index.ts
│     ├─ payment.ts
│     └─ ticket.ts
├─ tailwind.config.js
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts

```

<!-- Add a comment for Strix test -->
