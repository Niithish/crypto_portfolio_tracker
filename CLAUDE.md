# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build project with Turbopack
- `npm run start` - Start production server

## Project Architecture

This is a Next.js 15.5.4 project with React 19.1.0 using the App Router. The project is configured with shadcn/ui but the component library hasn't been initialized yet.

### Key Technologies
- **Framework**: Next.js 15.5.4 with App Router and Turbopack
- **Styling**: Tailwind CSS v4 with inline configuration
- **UI Library**: shadcn/ui (New York style, CSS variables enabled)
- **TypeScript**: Strict mode enabled
- **Font**: Geist from Google Fonts

### Directory Structure
- `app/` - App Router pages and layout (currently has basic layout and empty home page)
- `lib/` - Utility functions (utils.ts for class merging)
- `hooks/` - Custom React hooks (use-mobile.ts for responsive detection)
- `components/` - Component directory (configured but mostly empty)
- `components/ui/` - shadcn/ui components (not yet created)

### Configuration
- **shadcn/ui**: Configured with New York style, CSS variables, Lucide icons
- **Dark Mode**: Enabled by default in layout.tsx
- **Path Aliases**: `@/*` maps to project root
- **CSS**: Uses Tailwind v4 inline config with theme variables

### Important Notes
- The project uses Tailwind CSS v4 with inline configuration in globals.css
- Dark mode is globally enabled via `className="dark"` in layout.tsx
- shadcn/ui is configured but no components have been added yet
- The home page (app/page.tsx) is currently empty and needs content
- TypeScript strict mode is enabled with proper path resolution

### Development Guidelines
- Use the `cn()` utility from `@/lib/utils` for class merging
- Mobile detection hook available at `@/hooks/use-mobile`
- Follow shadcn/ui component patterns when adding UI elements
- All CSS variables are defined for both light and dark themes