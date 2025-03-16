import React, { createContext, useContext, useEffect, useState } from "react";

const LayoutContext = createContext();

let layouts = {};

function registerPageLayout({ Layout }) {
  layouts = { ...layouts, [Layout.name]: Layout };
}

export function createPageLayout({ Component }) {
  registerPageLayout({ Layout: Component });
  function LayoutSync(props) {
    const { setCurrentPageLayoutWithProps } = useContext(LayoutContext);

    useEffect(() => {
      setCurrentPageLayoutWithProps({ name: Component.name, props });

      return () => {
        setCurrentPageLayoutWithProps(null);
      };
    }, [props]);

    return null;
  }

  return LayoutSync;
}

export function PageRenderOutlet({ children }) {
  const { currentPageLayoutWithProps } = useContext(LayoutContext);

  const CurrentLayout =
    currentPageLayoutWithProps && layouts[currentPageLayoutWithProps.name];

  return (
    <>
      {CurrentLayout ? (
        <CurrentLayout {...currentPageLayoutWithProps.props} />
      ) : null}
      {children}
    </>
  );
}

export function PageLayoutProvider({ children }) {
  const [currentPageLayoutWithProps, setCurrentPageLayoutWithProps] =
    useState(null);

  return (
    <LayoutContext.Provider
      value={{
        setCurrentPageLayoutWithProps,
        currentPageLayoutWithProps,
        registerPageLayout,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}
