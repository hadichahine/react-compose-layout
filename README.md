# react-compose-layout

A React library for managing page layouts in a composable and efficient way. This library helps you create reusable layouts that persist across route changes, preventing unnecessary remounts of layout components.

## Features

- 🔄 Persistent layouts across route changes
- 🎯 Efficient layout management with minimal re-renders
- 🔌 Optional integration with React Router
- 📦 Lightweight with minimal dependencies (only requires React)

## Installation

```bash
npm install react-compose-layout
# or
yarn add react-compose-layout
```

## Requirements

- React ^18.3.1
- Node.js >=20.0.0

The library has been tested against React Router v6 but does not directly depend on it. React Router is an optional peer dependency that you can install if you need routing capabilities.

## Usage

### 1. Wrap your app with PageLayoutProvider

First, wrap your application with the `PageLayoutProvider`:

```jsx
import { PageLayoutProvider } from "react-compose-layout";

function App() {
  return <PageLayoutProvider>{/* Your app content */}</PageLayoutProvider>;
}
```

### 2. Create a Layout Component

Create your layout component as you normally would:

```jsx
function MainLayout({ children, title }) {
  return (
    <div>
      <header>
        <nav>{/* Your navigation */}</nav>
      </header>
      <main>
        <h1>{title}</h1>
        {children}
      </main>
      <footer>{/* Your footer */}</footer>
    </div>
  );
}
```

### 3. Create a Page Layout

Use `createPageLayout` to create a layout component that can be used across different pages:

```jsx
import { createPageLayout } from "react-compose-layout";

const Layout = createPageLayout({ Component: MainLayout });
```

### 4. Use the Layout in Your Pages

Apply the layout to your pages and pass any props it needs:

```jsx
function HomePage() {
  return (
    <Layout title="Welcome to the Home Page">
      <p>This is our homepage content</p>
      {/* Your page content */}
    </Layout>
  );
}

function AboutPage() {
  return (
    <Layout title="About Us">
      <p>Learn more about our company</p>
      {/* Your page content */}
    </Layout>
  );
}
```

### Example with React Router (Recommended)

For proper integration with React Router, you'll need to use the `PageRenderOutlet` component along with React Router's `Outlet`. Note that `PageRenderOutlet` can also be used without React Router in other scenarios where you need to control layout rendering:

```jsx
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { PageLayoutProvider, PageRenderOutlet } from "react-compose-layout";

function App() {
  return (
    <BrowserRouter>
      <PageLayoutProvider>
        <Routes>
          <Route
            element={
              <PageRenderOutlet>
                <Outlet />
              </PageRenderOutlet>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>
        </Routes>
      </PageLayoutProvider>
    </BrowserRouter>
  );
}
```

## How It Works

The library uses React's Context API to manage layouts efficiently. When you switch between pages that use the same layout, the layout component doesn't remount, improving performance and maintaining layout state. This is achieved through the `PageLayoutProvider` and `PageRenderOutlet` components working together to manage the layout lifecycle.

## API Reference

### `PageLayoutProvider`

A provider component that manages the layout state.

```jsx
<PageLayoutProvider>{/* Your app content */}</PageLayoutProvider>
```

### `createPageLayout`

A function that creates a layout component.

```jsx
createPageLayout({ Component: LayoutComponent });
```

#### Parameters:

- `Component`: The React component to be used as a layout

#### Returns:

- A layout component that can be used to wrap page content

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
