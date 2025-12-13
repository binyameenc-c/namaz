import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import logo from '@assets/logo-social_1765305531532.png';
import { AuthProvider } from "@/lib/auth";

// Pages
import Home from "@/pages/Home";
import ClassSelect from "@/pages/ClassSelect";
import Attendance from "@/pages/Attendance";
import Reports from "@/pages/Reports";
import Students from "@/pages/Students";
import Settings from "@/pages/Settings";
import Classes from "@/pages/Classes";

function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1000);
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

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/select-class/:type" component={ClassSelect} />
        <Route path="/attendance/:type/:classId" component={Attendance} />
        <Route path="/reports" component={Reports} />
        <Route path="/summary" component={Reports} />
        <Route path="/classes" component={Classes} />
        <Route path="/students" component={Students} />
        <Route path="/settings" component={Settings} />
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
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
