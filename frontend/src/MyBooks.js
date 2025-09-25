import React, { useEffect, useState } from 'react';
import API_BASE_URL from './config';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import BookIcon from '@mui/icons-material/Book';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { motion, AnimatePresence } from 'framer-motion';

const placeholderImg = 'https://via.placeholder.com/120x160?text=No+Image';

function getStatusChip(borrow) {
  if (borrow.returned) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <Chip label="Returned" color="success" size="small" sx={{ fontWeight: 600 }} />
        {borrow.fine > 0 && (
          <Chip
            label={`Fine: $${borrow.fine}`}
            color="warning"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        )}
      </Box>
    );
  }
  const due = new Date(borrow.dueDate);
  const now = new Date();
  if (now > due) {
    const daysLate = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
    const fine = daysLate * 10; // 10 units per day late
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <Chip
          label="Overdue"
          color="error"
          size="small"
          sx={{ fontWeight: 600 }}
          icon={<WarningIcon />}
        />
        <Chip
          label={`Fine: $${fine}`}
          color="error"
          size="small"
          sx={{ fontWeight: 600 }}
        />
      </Box>
    );
  }
  return <Chip label="Borrowed" color="primary" size="small" sx={{ fontWeight: 600 }} />;
}

export default function MyBooks() {
  const [borrows, setBorrows] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [show, setShow] = useState(false);
  const [returnedId, setReturnedId] = useState(null);

  // Calculate overdue books
  const overdueBooks = borrows.filter(borrow => {
    if (borrow.returned) return false;
    const due = new Date(borrow.dueDate);
    const now = new Date();
    return now > due;
  });

  useEffect(() => {
    setShow(true);
    const token = localStorage.getItem('userToken');
    fetch(`${API_BASE_URL}/user/borrowed`, {
      headers: { token }
    })
      .then(res => res.json())
      .then(data => {
        setBorrows(data.borrows || []);
        setBooks(data.books || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load borrowed books');
        setLoading(false);
      });
  }, []);

  const handleReturn = async (borrowId) => {
    setError('');
    setMessage('');
    const token = localStorage.getItem('userToken');
    if (!token) {
      setError('You must be logged in to return books.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/book/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({ borrowId })
      });
      const data = await res.json();
      if (res.ok) {
        setReturnedId(borrowId);
        setMessage('Book returned!');
        setTimeout(() => setReturnedId(null), 1200);
        // Optionally, refresh borrows after a delay
        setTimeout(() => {
          setLoading(true);
          fetch('http://localhost:3001/user/borrowed', { headers: { token } })
            .then(res => res.json())
            .then(data => {
              setBorrows(data.borrows || []);
              setBooks(data.books || []);
              setLoading(false);
            });
        }, 1200);
      } else {
        setError(data.message || 'Return failed');
      }
    } catch (e) {
      setError('Network error');
    }
  };

  if (loading) return <Typography>Loading your books...</Typography>;
  return (
    <Box sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Fade in={show} timeout={600}>
        <Box width="100%">
          <Typography variant="h4" align="center" gutterBottom fontWeight={700} color="primary.main">My Books</Typography>

          {overdueBooks.length > 0 && (
            <Alert
              severity="warning"
              sx={{ mb: 2 }}
              icon={<WarningIcon />}
            >
              <Typography variant="body2" fontWeight={600}>
                You have {overdueBooks.length} overdue book{overdueBooks.length > 1 ? 's' : ''}.
                Please return them to avoid additional fines.
              </Typography>
            </Alert>
          )}

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

          {borrows.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <BookIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No Books Borrowed
              </Typography>
              <Typography variant="body1" color="text.secondary">
                You haven't borrowed any books yet. Visit the Books page to explore available titles.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={4} justifyContent="center">
              {borrows.map(borrow => (
                <Grid item xs={12} sm={6} md={4} key={borrow._id}>
                  {(() => {
                    const book = books.find(b => b._id === (borrow.bookId || borrow.book?._id));
                    return (
                      <motion.div
                        whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(80,120,255,0.13)' }}
                        style={{ height: '100%' }}
                      >
                        <Card
                          elevation={0}
                          sx={{
                            height: 440,
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 4,
                            overflow: 'hidden',
                            background: 'rgba(255,255,255,0.85)',
                            boxShadow: '0 4px 32px 0 rgba(80,120,255,0.07)',
                            backdropFilter: 'blur(8px)',
                            p: 0,
                          }}
                        >
                          <Box sx={{ height: 180, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            <img
                              src={book?.imageUrl || placeholderImg}
                              alt={book?.title}
                              style={{ width: 'auto', height: '100%', maxHeight: 180, maxWidth: '100%', objectFit: 'cover', transition: 'transform 0.3s', borderRadius: 0 }}
                              onError={e => { e.target.src = placeholderImg; }}
                            />
                          </Box>
                          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <BookIcon color="primary" />
                              <Typography variant="h6" fontWeight={600} noWrap>{book?.title}</Typography>
                            </Box>
                            <Typography color="text.secondary" noWrap>{book?.author}</Typography>
                            <Typography variant="body2" sx={{ mt: 1, mb: 1, minHeight: 48, color: '#555' }}>
                              {book?.description?.length > 80 ? book.description.slice(0, 80) + '...' : book?.description}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>Due: {new Date(borrow.dueDate).toLocaleDateString()}</Typography>
                            <Box mt={1} mb={1}>{getStatusChip(borrow)}</Box>
                            <Box mt={1} position="relative" minHeight={40}>
                              <AnimatePresence>
                                {!borrow.returned && returnedId === borrow._id ? (
                                  <motion.div
                                    key="returned"
                                    initial={{ scale: 0.7, opacity: 0 }}
                                    animate={{ scale: 1.2, opacity: 1 }}
                                    exit={{ scale: 0.7, opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}
                                  >
                                    <CheckCircleIcon sx={{ color: '#43a047', fontSize: 36 }} />
                                  </motion.div>
                                ) : !borrow.returned ? (
                                  <motion.div key="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <Button
                                      variant="contained"
                                      sx={{ borderRadius: 2, fontWeight: 600, width: '100%' }}
                                      onClick={() => handleReturn(borrow._id)}
                                    >
                                      Return
                                    </Button>
                                  </motion.div>
                                ) : null}
                              </AnimatePresence>
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })()}
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Fade>
    </Box>
  );
} 