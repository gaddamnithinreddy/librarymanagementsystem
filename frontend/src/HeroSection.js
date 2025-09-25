import React from 'react';
import { motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { Link } from 'react-router-dom';
import '@fontsource/poppins/700.css';
import { useTheme } from './ThemeContext';

const floatingBooks = [
  { left: '10%', top: '20%', size: 48, delay: 0 },
  { left: '80%', top: '30%', size: 36, delay: 0.2 },
  { left: '20%', top: '70%', size: 32, delay: 0.4 },
  { left: '70%', top: '80%', size: 40, delay: 0.6 },
];

export default function HeroSection() {
  const { darkMode } = useTheme();

  return (
    <Box
      sx={{
        minHeight: { xs: '60vh', sm: '70vh', md: '80vh' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: darkMode
          ? 'linear-gradient(120deg, #1e293b 0%, #334155 100%)'
          : 'linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%)',
        borderRadius: { xs: 3, sm: 4, md: 6 },
        mt: { xs: 2, sm: 4, md: 10 },
        mb: { xs: 2, sm: 3, md: 4 },
        mx: { xs: 1, sm: 2, md: 0 },
      }}
    >
      {/* Animated Gradient Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background:
            darkMode
              ? 'radial-gradient(circle at 60% 40%, #475569 0%, #1e293b 60%, transparent 100%)'
              : 'radial-gradient(circle at 60% 40%, #aee1f9 0%, #e0e7ff 60%, transparent 100%)',
          filter: 'blur(40px)',
        }}
      />
      {/* Floating Book Icons */}
      {floatingBooks.map((b, i) => (
        <motion.div
          key={i}
          initial={{ y: 0, opacity: 0.7 }}
          animate={{ y: [0, -20, 0], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 4, repeat: Infinity, delay: b.delay }}
          style={{
            position: 'absolute',
            left: b.left,
            top: b.top,
            fontSize: b.size,
            zIndex: 1,
            pointerEvents: 'none',
            color: darkMode ? '#6366f1' : '#1976d2',
            opacity: 0.15,
          }}
        >
          <span role="img" aria-label="book">📘</span>
        </motion.div>
      ))}
      <Box
        sx={{
          zIndex: 2,
          width: '100%',
          maxWidth: { xs: '90%', sm: 500, md: 600 },
          mx: 'auto',
          textAlign: 'center',
          p: { xs: 2, sm: 3, md: 4 },
          background: darkMode
            ? 'rgba(30,41,59,0.7)'
            : 'rgba(255,255,255,0.7)',
          borderRadius: { xs: 3, sm: 4, md: 6 },
          boxShadow: darkMode
            ? '0 8px 32px 0 rgba(99,102,241,0.15)'
            : '0 8px 32px 0 rgba(80,120,255,0.07)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2, type: 'spring' }}
        >
          <Typography
            variant="h2"
            fontWeight={800}
            color="primary.main"
            gutterBottom
            sx={{
              fontFamily: 'Poppins, sans-serif',
              letterSpacing: 1,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3.75rem' },
              lineHeight: { xs: 1.2, sm: 1.3, md: 1.2 }
            }}
          >
            Welcome to the Library
          </Typography>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5, type: 'spring' }}
        >
          <Typography
            variant="h5"
            color="text.secondary"
            mb={4}
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
              px: { xs: 1, sm: 2, md: 0 }
            }}
          >
            Discover, borrow, and manage your books easily
          </Typography>
        </motion.div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 3, sm: 2, md: 3 },
            flexWrap: 'wrap',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            maxWidth: { xs: '100%', sm: 'none' },
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          <AnimatedButton to="/login" icon={<LoginIcon />} color="primary">
            USER LOGIN
          </AnimatedButton>
          <AnimatedButton to="/signup" icon={<PersonAddAltIcon />} color="secondary">
            USER SIGNUP
          </AnimatedButton>
          <AnimatedButton to="/admin/login" icon={<AdminPanelSettingsIcon />} color="primary">
            ADMIN LOGIN
          </AnimatedButton>
          <AnimatedButton to="/admin/signup" icon={<PersonAddAltIcon />} color="secondary">
            ADMIN SIGNUP
          </AnimatedButton>
        </motion.div>
      </Box>
    </Box>
  );
}

function AnimatedButton({ to, icon, color, children }) {
  const { darkMode, theme } = useTheme();

  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Button
        component={Link}
        to={to}
        variant="contained"
        color={color}
        startIcon={icon}
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 1.2, sm: 1.5 },
          fontWeight: 700,
          fontFamily: 'Poppins, sans-serif',
          borderRadius: 3,
          boxShadow: '0 2px 12px 0 rgba(80,120,255,0.07)',
          background: color === 'secondary'
            ? (darkMode
              ? 'linear-gradient(90deg, #10b981 0%, #22c55e 100%)'
              : 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)'
            )
            : (darkMode
              ? 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)'
              : theme.palette.primary.main
            ),
          color: color === 'secondary'
            ? (darkMode ? '#fff' : '#222')
            : '#fff',
          position: 'relative',
          overflow: 'hidden',
          transition: 'background 0.3s, color 0.3s',
          fontSize: { xs: '0.875rem', sm: '1rem' },
          minWidth: { xs: 220, sm: 'auto' },
          width: { xs: '100%', sm: 'auto' },
          maxWidth: { xs: 320, sm: 'none' },
          mb: { xs: 0.5, sm: 0 },
          '&:hover': {
            background: color === 'secondary'
              ? (darkMode
                ? 'linear-gradient(90deg, #059669 0%, #16a34a 100%)'
                : 'linear-gradient(90deg, #38f9d7 0%, #43e97b 100%)'
              )
              : (darkMode
                ? 'linear-gradient(45deg, #5855eb 30%, #7c3aed 90%)'
                : theme.palette.primary.dark
              ),
            boxShadow: '0 4px 24px 0 rgba(80,120,255,0.13)',
          },
        }}
      >
        {children}
      </Button>
    </motion.div>
  );
} 