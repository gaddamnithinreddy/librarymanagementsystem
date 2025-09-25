import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { motion } from 'framer-motion';
import '@fontsource/poppins/600.css';
import { useTheme } from './ThemeContext';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Books', to: '/books' },
  { label: 'My Books', to: '/mybooks' },
  { label: 'Admin Books', to: '/admin/books' },
];

export default function Navbar() {
  const location = useLocation();
  const { darkMode, toggleDarkMode, theme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: darkMode
          ? 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)'
          : 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: darkMode
          ? '1px solid rgba(102,102,241,0.2)'
          : '1px solid rgba(200,200,255,0.15)',
        boxShadow: darkMode
          ? '0 8px 32px 0 rgba(99,102,241,0.15)'
          : '0 4px 32px 0 rgba(80,120,255,0.07)',
        color: theme.palette.text.primary,
        fontFamily: 'Poppins, sans-serif',
        zIndex: 1201,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 64, sm: 72 }, px: { xs: 2, sm: 3 } }}>
        <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }}>
          <Typography
            variant={{ xs: 'h6', sm: 'h5' }}
            fontWeight={700}
            sx={{
              letterSpacing: 1,
              fontFamily: 'Poppins, sans-serif',
              color: 'primary.main',
              fontSize: { xs: '1.1rem', sm: '1.5rem' }
            }}
          >
            <span role="img" aria-label="book">📘</span>
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Library Management
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
              Library
            </Box>
          </Typography>
        </Box>

        {/* Desktop Navigation */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 2
          }}
        >
          {navLinks.map((link, idx) => (
            <motion.div
              key={link.to}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx, type: 'spring', stiffness: 120 }}
              style={{ position: 'relative' }}
            >
              <Box
                component={Link}
                to={link.to}
                onClick={handleMobileMenuClose}
                sx={{
                  px: 2,
                  py: 1,
                  fontWeight: 600,
                  fontFamily: 'Poppins, sans-serif',
                  color: location.pathname === link.to ? 'primary.main' : 'inherit',
                  textDecoration: 'none',
                  position: 'relative',
                  transition: 'color 0.2s',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                {link.label}
                {location.pathname === link.to && (
                  <motion.div
                    layoutId="underline"
                    style={{
                      position: 'absolute',
                      left: 8,
                      right: 8,
                      bottom: 2,
                      height: 3,
                      borderRadius: 2,
                      background: theme.palette.primary.main,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Box>
            </motion.div>
          ))}
          <IconButton
            color="inherit"
            sx={{ ml: 1 }}
            onClick={toggleDarkMode}
            aria-label="toggle dark mode"
          >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Box>

        {/* Mobile Menu Button and Theme Toggle */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            onClick={toggleDarkMode}
            aria-label="toggle dark mode"
            size="small"
          >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <IconButton
            color="inherit"
            onClick={handleMobileMenuToggle}
            aria-label="toggle mobile menu"
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </Box>
      </Toolbar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            background: darkMode
              ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
              : 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            borderLeft: darkMode
              ? '1px solid rgba(102,102,241,0.2)'
              : '1px solid rgba(200,200,255,0.15)',
          },
        }}
      >
        <Box sx={{ pt: 8 }}>
          <List>
            {navLinks.map((link, index) => (
              <ListItem key={link.to} sx={{ py: 0 }}>
                <Box
                  component={Link}
                  to={link.to}
                  onClick={handleMobileMenuClose}
                  sx={{
                    width: '100%',
                    py: 2,
                    px: 3,
                    fontWeight: 600,
                    fontFamily: 'Poppins, sans-serif',
                    color: location.pathname === link.to ? 'primary.main' : 'inherit',
                    textDecoration: 'none',
                    borderRadius: 2,
                    mx: 1,
                    transition: 'all 0.2s',
                    backgroundColor: location.pathname === link.to
                      ? (darkMode ? 'rgba(102,102,241,0.1)' : 'rgba(25,118,210,0.1)')
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: darkMode
                        ? 'rgba(102,102,241,0.1)'
                        : 'rgba(25,118,210,0.05)',
                      color: 'primary.main',
                    },
                  }}
                >
                  {link.label}
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
} 