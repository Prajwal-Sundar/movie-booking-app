import React from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Error404 from "./pages/Error404";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div className="flex flex-col min-h-screen relative">
        {/* Header wrapper */}
        <div className="sticky top-0 z-50">
          <Header />
        </div>

        {/* Scrollable main content between header and footer */}
        <div className="flex-1 overflow-y-auto pb-20">
          {/* pb-20 prevents content from being hidden behind fixed footer */}
          <Outlet />
        </div>

        {/* Footer wrapper */}
        <div className="fixed bottom-0 left-0 w-full z-50">
          <Footer />
        </div>
      </div>
    ),
    errorElement: <Error404 />,
    children: [
      { index: true, element: <Home /> },
      { path: "*", element: <Error404 /> },
    ],
  },
]);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
