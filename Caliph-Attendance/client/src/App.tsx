import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import { useState, useEffect, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import logo from '@assets/logo-social_1765305531532.png';
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";

// Eagerly load core pages
import Home from "@/pages/Home";
import ClassSelect from "@/pages/ClassSelect";
import Attendance from "@/pages/Attendance";

// Lazy load heavy pages for faster initial load
const Reports = lazy(() => import("@/pages/Reports"));
const Students = lazy(() => import("@/pages/Students"));
const Settings = lazy(() => import("@/pages/Settings"));
const Classes = lazy(() => import("@/pages/Classes"));

function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    // Keep splash longer on mobile to let code split chunks load
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-gradient-to-b from-emerald-400 to-emerald-600 flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white p-6 rounded-[2rem] shadow-2xl"
      >
        <img src={logo} alt="Caliph Logo" className="w-32 h-32 object-contain" />
      </motion.div>
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-8 text-3xl font-bold text-white font-heading tracking-wider"
      >
        CALIPH
      </motion.h1>
    </motion.div>
  );
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/select-class/:type" component={ClassSelect} />
        <Route path="/attendance/:type/:classId" component={Attendance} />
        <Route path="/reports">
          <Suspense fallback={<PageLoader />}>
            <Reports />
          </Suspense>
        </Route>
        <Route path="/summary">
          <Suspense fallback={<PageLoader />}>
            <Reports />
          </Suspense>
        </Route>
        <Route path="/classes">
          <Suspense fallback={<PageLoader />}>
            <Classes />
          </Suspense>
        </Route>
        <Route path="/students">
          <Suspense fallback={<PageLoader />}>
            <Students />
          </Suspense>
        </Route>
        <Route path="/settings">
          <Suspense fallback={<PageLoader />}>
            <Settings />
          </Suspense>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <AnimatePresence mode="wait">
            {showSplash ? (
              <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
            ) : (
              <motion.div 
                key="app"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Toaster />
                <Router />
              </motion.div>
            )}
          </AnimatePresence>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
