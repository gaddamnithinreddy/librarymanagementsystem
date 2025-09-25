import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import UserLogin from './UserLogin';
import UserSignup from './UserSignup';
import UserBooks from './UserBooks';
import MyBooks from './MyBooks';
import AdminLogin from './AdminLogin';
import AdminBooks from './AdminBooks';
import AdminUsers from './AdminUsers';
import AdminSignup from './AdminSignup';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeContextProvider, useTheme } from './ThemeContext';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.5 }}>
            <HeroSection />
          </motion.div>
        } />
        <Route path="/login" element={
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.5 }}>
            <UserLogin />
          </motion.div>
        } />
        <Route path="/signup" element={
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.5 }}>
            <UserSignup />
          </motion.div>
        } />
        <Route path="/books" element={
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.5 }}>
            <UserBooks />
          </motion.div>
        } />
        <Route path="/mybooks" element={
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.5 }}>
            <MyBooks />
          </motion.div>
        } />
        <Route path="/admin/login" element={
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.5 }}>
            <AdminLogin />
          </motion.div>
        } />
        <Route path="/admin/books" element={
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.5 }}>
            <AdminBooks />
          </motion.div>
        } />
        <Route path="/admin/users" element={
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.5 }}>
            <AdminUsers />
          </motion.div>
        } />
        <Route path="/admin/signup" element={
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.5 }}>
            <AdminSignup />
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  );
}

function AppContent() {
  const { theme, darkMode } = useTheme();

  return (
    <Box sx={{
      minHeight: '100vh',
      background: darkMode
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
        : theme.palette.background.default,
      backgroundAttachment: 'fixed'
    }}>
      <Router>
        <Navbar />
        <Container
          maxWidth="xl"
          sx={{
            pt: { xs: 8, sm: 10, md: 14 },
            pb: { xs: 4, sm: 5, md: 6 },
            px: { xs: 1, sm: 2, md: 3 }
          }}
        >
          <AnimatedRoutes />
        </Container>
      </Router>
    </Box>
  );
}

function App() {
  return (
    <ThemeContextProvider>
      <CssBaseline />
      <AppContent />
    </ThemeContextProvider>
  );
}

export default App;
