# Meesho AI Seller Pro v2

Clean production-ready React/Vite foundation for a seller productivity SaaS.

## Included
- Seller dashboard
- AI listing workflow with local fallback
- Pricing & profit calculator
- Products CRUD in browser state
- Orders lifecycle UI
- Analytics overview
- AI assistant shell
- Responsive desktop/tablet/mobile design
- Vercel-ready configuration

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

This first deployment intentionally avoids external database/API dependencies so the Vercel build stays deterministic. Cloud auth, database, storage, real AI providers and authorized marketplace integrations can be added incrementally after the clean baseline is verified.
