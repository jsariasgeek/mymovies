# mymovies

A web application to browse, manage, and explore your favorite movies. Built with Vue 3 and Vite, this project provides a fast and modern user experience, along with developer-friendly tooling for testing, building, and deployment.

## Features

- Search and browse movies
- Responsive user interface
- Built using Vue 3 Composition API
- TypeScript support with full `.vue` type checking
- Unit and end-to-end testing
- Automated CI/CD deployment (GitHub Actions & AWS)

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) with [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
  - (Disable Vetur if enabled)

## TypeScript & Vue File Support

TypeScript does not natively recognize `.vue` file types. To get accurate type-checking, use [vue-tsc](https://github.com/johnsoncodehk/vue-tsc), and make sure Volar is enabled in your editor.

## How to Run the Project

### 1. Install Dependencies

```sh
npm install
```

### 2. Start the Development Server

Launch the local dev server (with hot reload):
```sh
npm run dev
```

Open your browser at [http://localhost:5173](http://localhost:5173) (or the URL shown in the console).

### 3. Build for Production

Compile and minify for production:
```sh
npm run build
```

### 4. Run Unit Tests

With [Vitest](https://vitest.dev/):
```sh
npm run test:unit
```

### 5. Run End-to-End Tests

With [Cypress](https://www.cypress.io/) against the dev server:
```sh
npm run test:e2e:dev
```

To test the production build (recommended before deploy/CI):

```sh
npm run build
npm run test:e2e
```

### 6. Lint the Code

With [ESLint](https://eslint.org/):

```sh
npm run lint
```

## Deployment

Deployment is automated through GitHub Actions. Pushing to `main` or `master` triggers the build-and-deploy workflow, which will:

- Build the app (`npm run build`)
- Deploy to AWS
- Invalidate the CloudFront cache

You must configure your AWS keys and CloudFront distribution ID in the repository secrets for deployment to work. See `.github/workflows/build-and-deploy.yml` for details.