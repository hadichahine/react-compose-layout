import React, { useEffect } from "react";
import { render, fireEvent } from "@testing-library/react";
import { createPageLayout, PageLayoutProvider } from "../index";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";

test("should not mount and unmount the main layout when switching between two different components having the same layout", async () => {
  const mockedUseEffect = jest.fn(() => {
    return () => {};
  });

  function MainLayout({ children }) {
    useEffect(mockedUseEffect, []);

    return (
      <>
        <Link data-testid="page1-nav" to="/">
          Page 1
        </Link>
        <Link data-testid="page2-nav" to="/page2">
          Page 2
        </Link>
        {children}
      </>
    );
  }

  const Layout = createPageLayout({ Component: MainLayout });

  const Page1 = () => <Layout>Page 1 Content</Layout>;
  const Page2 = () => <Layout>Page 2 Content</Layout>;

  const App = () => {
    return (
      <MemoryRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <PageLayoutProvider>
          <Routes>
            <Route path="/" element={<Page1 />} />
            <Route path="/page2" element={<Page2 />} />
          </Routes>
        </PageLayoutProvider>
      </MemoryRouter>
    );
  };

  const { getByTestId, getByText } = render(<App />);

  fireEvent.click(getByTestId("page2-nav"));

  expect(getByText(/Page 2 Content/i));
  expect(mockedUseEffect).toHaveBeenCalledTimes(1);
});
