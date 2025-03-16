import React, { useEffect } from "react";
import { render, fireEvent } from "@testing-library/react";
import {
  createPageLayout,
  PageLayoutProvider,
  PageRenderOutlet,
} from "../index";
import { MemoryRouter, Route, Routes, useParams, Outlet } from "react-router";
import { Link } from "react-router-dom";

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

  const { getByTestId, getByText } = render(
    <TestRouter>
      <Route path="/" element={<Page1 />} />
      <Route path="/page2" element={<Page2 />} />
    </TestRouter>
  );

  fireEvent.click(getByTestId("page2-nav"));

  expect(getByText(/Page 2 Content/i));
  expect(mockedUseEffect).toHaveBeenCalledTimes(1);
});

test("should properly pass URL parameters to the layout component when used with react-router-dom", () => {
  let layoutCapturedParams;
  let pageCapturedParams;

  function ParameterizedLayout({ children }) {
    layoutCapturedParams = useParams();
    return <div>{children}</div>;
  }

  const Layout = createPageLayout({ Component: ParameterizedLayout });

  const DetailPage = () => {
    pageCapturedParams = useParams();
    return (
      <Layout>
        <div>Detail Content</div>
      </Layout>
    );
  };

  render(
    <TestRouter initialEntries={["/detail/123"]}>
      <Route path="/detail/:id" element={<DetailPage />} />
    </TestRouter>
  );

  expect(layoutCapturedParams).toEqual({ id: "123" });
  expect(pageCapturedParams).toEqual({ id: "123" });
});

function TestRouter({ children, initialEntries = ["/"] }) {
  return (
    <MemoryRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
      initialEntries={initialEntries}
    >
      <PageLayoutProvider>
        <Routes>
          <Route
            element={
              <PageRenderOutlet>
                <Outlet />
              </PageRenderOutlet>
            }
          >
            {children}
          </Route>
        </Routes>
      </PageLayoutProvider>
    </MemoryRouter>
  );
}
