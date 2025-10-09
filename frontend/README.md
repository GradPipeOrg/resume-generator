# Resume Generator Frontend

This is the frontend application for the Resume Generator, built with React and Vite.

## Environment Setup

Before running the application, you need to set up the environment variable for the API base URL.

### Required Environment Variable

Create a `.env` file in the frontend directory with the following content:

```
VITE_API_BASE_URL=http://localhost:8000
```

Replace `http://localhost:8000` with your actual backend API URL.

### Development

```bash
npm install
npm run dev
```

### Production Build

```bash
npm run build
```

## API Configuration

The application uses the `VITE_API_BASE_URL` environment variable to connect to the backend API. This allows for easy configuration across different environments (development, staging, production).

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
