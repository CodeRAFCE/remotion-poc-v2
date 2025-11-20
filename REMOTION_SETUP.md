# Remotion POC v2

A fresh Remotion setup based on the GitHub Unwrapped project structure.

## Project Structure

```
remotion-poc-v2/
├── remotion/           # Remotion compositions and components
│   ├── Root.tsx       # Root component with all compositions
│   └── index.ts       # Entry point for Remotion
├── src/
│   └── config.ts      # Configuration and schemas
├── types/
│   └── constants.ts   # Constants used across the project
├── public/            # Static assets
├── app/               # Next.js app directory
└── package.json
```

## Getting Started

### Installation

```bash
npm install
```

### Development

#### Run Next.js development server:

```bash
npm run dev
```

#### Open Remotion Studio:

```bash
npm run remotion
```

#### Render a composition:

```bash
npm run render HelloWorld out/video.mp4
```

## Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build Next.js application
- `npm run start` - Start production server
- `npm run remotion` - Open Remotion Studio
- `npm run render` - Render a composition

## Technologies

- **Next.js 16** - React framework
- **Remotion 4.0.240** - Video creation framework
- **TypeScript** - Type safety
- **React 18** - UI library
- **Zod** - Schema validation
- **React Spring** - Animation library

## Configuration Files

- `remotion.config.ts` - Remotion configuration
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.json` - ESLint configuration
- `.prettierrc.mjs` - Prettier configuration
- `.env.example` - Environment variables template

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

## Video Specifications

Default video specifications (defined in `types/constants.ts`):

- **Width**: 1080px
- **Height**: 1080px
- **FPS**: 30

## Remotion Compositions

The project includes a basic "HelloWorld" composition. You can add more compositions in `remotion/Root.tsx`.

## Learn More

- [Remotion Documentation](https://www.remotion.dev/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [GitHub Unwrapped Original Project](https://github.com/remotion-dev/github-unwrapped-2023)

## License

This is a proof of concept project based on the GitHub Unwrapped structure.
