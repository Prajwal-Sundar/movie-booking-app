import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Outlet,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Error404 from "./pages/Error404";

const Layout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <Header />
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-x-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="bg-white shadow-inner mt-auto">
        <Footer />
      </footer>
    </div>
  );
};

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="*" element={<Error404 />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
};

export default App;
