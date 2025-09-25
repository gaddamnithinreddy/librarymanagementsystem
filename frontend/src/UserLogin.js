import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Fade from '@mui/material/Fade';
import LockIcon from '@mui/icons-material/Lock';
import { useTheme } from './ThemeContext';
import API_BASE_URL from './config';

export default function UserLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const { darkMode, theme } = useTheme();

  React.useEffect(() => { setShow(true); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/user/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('userToken', data.token);
        navigate('/books');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (e) {
      setError('Network error');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: darkMode
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
        : 'linear-gradient(135deg, #e3f0ff 0%, #fafcff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: { xs: 2, sm: 3, md: 0 },
      py: { xs: 2, sm: 4 }
    }}>
      <Fade in={show} timeout={600}>
        <Paper elevation={6} sx={{
          p: { xs: 3, sm: 4, md: 5 },
          maxWidth: { xs: '100%', sm: 400 },
          width: '100%',
          borderRadius: 4,
          background: darkMode
            ? 'linear-gradient(145deg, #1e293b 0%, #334155 100%)'
            : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          border: darkMode ? '1px solid rgba(99,102,241,0.2)' : 'none',
          boxShadow: darkMode
            ? '0 8px 32px 0 rgba(99,102,241,0.15)'
            : '0 4px 32px 0 rgba(80,120,255,0.07)'
        }}>
          <Typography variant="h4" align="center" gutterBottom fontWeight={700} color="primary.main" sx={{
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' }
          }}>User Login</Typography>
          <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={3} mt={2}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              fullWidth
              autoFocus
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: darkMode ? theme.palette.text.primary : 'inherit',
                  '& fieldset': {
                    borderColor: darkMode ? '#475569' : 'rgba(0, 0, 0, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: darkMode ? '#64748b' : 'rgba(0, 0, 0, 0.87)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: darkMode ? '#94a3b8' : 'rgba(0, 0, 0, 0.6)',
                  '&.Mui-focused': {
                    color: theme.palette.primary.main,
                  },
                },
              }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              fullWidth
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: darkMode ? theme.palette.text.primary : 'inherit',
                  '& fieldset': {
                    borderColor: darkMode ? '#475569' : 'rgba(0, 0, 0, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: darkMode ? '#64748b' : 'rgba(0, 0, 0, 0.87)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: darkMode ? '#94a3b8' : 'rgba(0, 0, 0, 0.6)',
                  '&.Mui-focused': {
                    color: theme.palette.primary.main,
                  },
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<LockIcon />}
              sx={{
                mt: 1,
                borderRadius: 2,
                fontWeight: 600,
                background: darkMode
                  ? 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)'
                  : theme.palette.primary.main,
                '&:hover': {
                  background: darkMode
                    ? 'linear-gradient(45deg, #5855eb 30%, #7c3aed 90%)'
                    : theme.palette.primary.dark,
                },
              }}
            >
              Login
            </Button>
          </Box>
          {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
        </Paper>
      </Fade>
    </Box>
  );
} 