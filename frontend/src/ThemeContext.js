import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeContextProvider');
    }
    return context;
};

export const ThemeContextProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
    };

    const lightTheme = createTheme({
        palette: {
            mode: 'light',
            primary: {
                main: '#1976d2',
                light: '#63a4ff',
                dark: '#004ba0',
            },
            secondary: {
                main: '#43a047',
                light: '#76d275',
                dark: '#00701a',
            },
            background: {
                default: '#f8fafc',
                paper: '#fff',
            },
            text: {
                primary: '#1a1a1a',
                secondary: '#666',
            },
        },
        shape: {
            borderRadius: 16,
        },
        typography: {
            fontFamily: 'Poppins, Inter, Roboto, Arial, sans-serif',
            h2: { fontWeight: 800 },
            h4: { fontWeight: 700 },
            h5: { fontWeight: 700 },
        },
    });

    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
            primary: {
                main: '#6366f1', // Modern indigo
                light: '#8b5cf6', // Purple accent
                dark: '#4338ca',
            },
            secondary: {
                main: '#10b981', // Emerald green
                light: '#34d399',
                dark: '#059669',
            },
            background: {
                default: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', // Gradient background
                paper: '#1e293b', // Slate gray
            },
            surface: {
                main: '#334155', // Card surfaces
            },
            text: {
                primary: '#f8fafc', // Almost white
                secondary: '#cbd5e1', // Light gray
            },
            divider: '#334155',
            success: {
                main: '#22c55e',
            },
            warning: {
                main: '#f59e0b',
            },
            error: {
                main: '#ef4444',
            },
        },
        shape: {
            borderRadius: 16,
        },
        typography: {
            fontFamily: 'Poppins, Inter, Roboto, Arial, sans-serif',
            h2: { fontWeight: 800 },
            h4: { fontWeight: 700 },
            h5: { fontWeight: 700 },
        },
    });

    const theme = darkMode ? darkTheme : lightTheme;

    const value = {
        darkMode,
        toggleDarkMode,
        theme,
    };

    return (
        <ThemeContext.Provider value={value}>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};