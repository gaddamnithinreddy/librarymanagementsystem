import React, { useEffect, useState } from 'react';
import API_BASE_URL from './config';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Rating from '@mui/material/Rating';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import SearchIcon from '@mui/icons-material/Search';
import BookIcon from '@mui/icons-material/Book';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import StarIcon from '@mui/icons-material/Star';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeContext';

const placeholderImg = 'https://via.placeholder.com/120x160?text=No+Image';

export default function UserBooks() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [show, setShow] = useState(false);
  const [borrowedId, setBorrowedId] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [wishlist, setWishlist] = useState(new Set());
  const [ratingDialog, setRatingDialog] = useState({ open: false, book: null, rating: 0, review: '' });
  const [submittedRating, setSubmittedRating] = useState(null);
  const { darkMode } = useTheme();

  useEffect(() => {
    setShow(true);
    Promise.all([
      fetch(`${API_BASE_URL}/book/all`).then(res => res.json()),
      fetchFavorites(),
      fetchWishlist()
    ])
      .then(([booksData]) => {
        setBooks(booksData.books || []);
        setFilteredBooks(booksData.books || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load books');
        setLoading(false);
      });
  }, []);

  const fetchFavorites = async () => {
    const token = localStorage.getItem('userToken');
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/user/favorites`, {
        headers: { 'token': token }
      });
      const data = await response.json();
      if (response.ok) {
        const favIds = new Set(data.favorites.map(fav => fav.bookId._id || fav.bookId));
        setFavorites(favIds);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const fetchWishlist = async () => {
    const token = localStorage.getItem('userToken');
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/user/wishlist`, {
        headers: { 'token': token }
      });
      const data = await response.json();
      if (response.ok) {
        const wishIds = new Set(data.wishlist.map(item => item.bookId._id || item.bookId));
        setWishlist(wishIds);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  useEffect(() => {
    const filtered = books.filter(book =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBooks(filtered);
  }, [searchTerm, books]);

  const handleBorrow = async (bookId) => {
    setError('');
    setMessage('');
    const token = localStorage.getItem('userToken');
    if (!token) {
      setError('You must be logged in to borrow books.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/book/borrow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({ bookId })
      });
      const data = await res.json();
      if (res.ok) {
        setBorrowedId(bookId);
        setMessage('Book borrowed! Due: ' + new Date(data.dueDate).toLocaleDateString());
        setTimeout(() => setBorrowedId(null), 1200);
      } else {
        setError(data.message || 'Borrow failed');
      }
    } catch (e) {
      setError('Network error');
    }
  };

  const toggleFavorite = async (bookId) => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      setError('You must be logged in to add favorites.');
      return;
    }

    try {
      if (favorites.has(bookId)) {
        const response = await fetch(`${API_BASE_URL}/user/favorites/${bookId}`, {
          method: 'DELETE',
          headers: { 'token': token }
        });
        if (response.ok) {
          setFavorites(prev => {
            const newSet = new Set(prev);
            newSet.delete(bookId);
            return newSet;
          });
          setMessage('Removed from favorites');
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/user/favorites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'token': token
          },
          body: JSON.stringify({ bookId })
        });
        if (response.ok) {
          setFavorites(prev => new Set([...prev, bookId]));
          setMessage('Added to favorites');
        }
      }
    } catch (error) {
      setError('Failed to update favorites');
    }
  };

  const toggleWishlist = async (bookId) => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      setError('You must be logged in to add to wishlist.');
      return;
    }

    try {
      if (wishlist.has(bookId)) {
        const response = await fetch(`${API_BASE_URL}/user/wishlist/${bookId}`, {
          method: 'DELETE',
          headers: { 'token': token }
        });
        if (response.ok) {
          setWishlist(prev => {
            const newSet = new Set(prev);
            newSet.delete(bookId);
            return newSet;
          });
          setMessage('Removed from wishlist');
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/user/wishlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'token': token
          },
          body: JSON.stringify({ bookId, priority: 'medium' })
        });
        if (response.ok) {
          setWishlist(prev => new Set([...prev, bookId]));
          setMessage('Added to wishlist');
        }
      }
    } catch (error) {
      setError('Failed to update wishlist');
    }
  };

  const submitRating = async () => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      setError('You must be logged in to rate books.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/book/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({
          bookId: ratingDialog.book._id,
          rating: ratingDialog.rating,
          review: ratingDialog.review
        })
      });

      if (response.ok) {
        setSubmittedRating(ratingDialog.book._id);
        setMessage('Rating submitted successfully!');
        setRatingDialog({ open: false, book: null, rating: 0, review: '' });
        // Hide the success indicator after 2 seconds
        setTimeout(() => setSubmittedRating(null), 2000);
        // Refresh books to get updated ratings
        const booksResponse = await fetch(`${API_BASE_URL}/book/all`);
        const booksData = await booksResponse.json();
        setBooks(booksData.books || []);
        setFilteredBooks(booksData.books || []);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to submit rating');
      }
    } catch (error) {
      setError('Failed to submit rating');
    }
  };

  if (loading) return <Typography>Loading books...</Typography>;

  return (
    <Box sx={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: { xs: 1, sm: 2, md: 0 }
    }}>
      <Fade in={show} timeout={600}>
        <Box width="100%">
          <Typography variant="h4" align="center" gutterBottom fontWeight={700} color="primary.main" sx={{
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
            px: { xs: 2, sm: 0 }
          }}>All Books</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', px: { xs: 2, sm: 0 } }}>
            <TextField
              placeholder="Search books by title, author, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                maxWidth: { xs: '100%', sm: 500 },
                width: '100%'
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
            />
          </Box>

          {filteredBooks.length === 0 && searchTerm ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <SearchIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No books found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Try searching with different keywords.
              </Typography>
            </Box>
          ) : filteredBooks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <BookIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No Books Available
              </Typography>
              <Typography variant="body1" color="text.secondary">
                There are currently no books in the library. Please check back later.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} justifyContent="center" sx={{ px: { xs: 1, sm: 2, md: 0 } }}>
              {filteredBooks.map(book => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 }} key={book._id}>
                  <motion.div
                    whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(80,120,255,0.13)' }}
                    style={{ height: '100%' }}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        height: { xs: 360, sm: 380, md: 400 },
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 4,
                        overflow: 'hidden',
                        background: darkMode
                          ? 'linear-gradient(145deg, #1e293b 0%, #334155 100%)'
                          : 'rgba(255,255,255,0.85)',
                        boxShadow: darkMode
                          ? '0 8px 32px 0 rgba(99,102,241,0.1), 0 2px 8px 0 rgba(0,0,0,0.3)'
                          : '0 4px 32px 0 rgba(80,120,255,0.07)',
                        backdropFilter: 'blur(8px)',
                        border: darkMode ? '1px solid rgba(99,102,241,0.2)' : 'none',
                        p: 0,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Box sx={{
                        height: { xs: 140, sm: 150, md: 160 },
                        background: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        <img
                          src={book.imageUrl || placeholderImg}
                          alt={book.title}
                          style={{
                            width: 'auto',
                            height: '100%',
                            maxHeight: { xs: 140, sm: 150, md: 160 },
                            maxWidth: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s',
                            borderRadius: 0
                          }}
                          onError={e => { e.target.src = placeholderImg; }}
                        />
                      </Box>
                      <CardContent sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        p: { xs: 1.2, sm: 1.5, md: 2 }
                      }}>
                        <Box>
                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <BookIcon color="primary" />
                              <Typography variant="h6" fontWeight={600} noWrap sx={{
                                maxWidth: { xs: 120, sm: 140, md: 160, lg: 180 },
                                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.125rem' }
                              }}>{book.title}</Typography>
                            </Box>
                            <Box display="flex" gap={0.5}>
                              <IconButton
                                size="small"
                                onClick={() => toggleFavorite(book._id)}
                                sx={{ color: favorites.has(book._id) ? '#f44336' : '#ccc' }}
                              >
                                {favorites.has(book._id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => toggleWishlist(book._id)}
                                sx={{ color: wishlist.has(book._id) ? '#ff9800' : '#ccc' }}
                              >
                                {wishlist.has(book._id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                              </IconButton>
                            </Box>
                          </Box>

                          <Typography color="text.secondary" noWrap>{book.author}</Typography>

                          {/* Rating Display */}
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
                            <Rating
                              value={book.averageRating || 0}
                              precision={0.1}
                              size="small"
                              readOnly
                            />
                            <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                              ({book.ratingsCount || 0})
                            </Typography>
                          </Box>

                          {/* Category Chip */}
                          {book.category && (
                            <Chip
                              label={book.category}
                              size="small"
                              sx={{ mb: 1, backgroundColor: darkMode ? '#374151' : '#f5f5f5' }}
                            />
                          )}

                          <Typography variant="body2" sx={{ mb: 1, minHeight: { xs: 36, sm: 40, md: 44 }, color: darkMode ? '#e2e8f0' : '#555' }}>
                            {book.description?.length > 60 ? book.description.slice(0, 60) + '...' : book.description}
                          </Typography>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                color: book.copiesAvailable > 0
                                  ? (darkMode ? '#10b981' : '#2e7d32')
                                  : (darkMode ? '#ef4444' : '#d32f2f')
                              }}
                            >
                              {book.copiesAvailable > 0 ? `${book.copiesAvailable} available` : 'Not available'}
                            </Typography>
                            {submittedRating === book._id ? (
                              <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '4px 8px',
                                  backgroundColor: darkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                  borderRadius: '6px',
                                  border: `1px solid ${darkMode ? '#22c55e' : '#22c55e'}`
                                }}
                              >
                                <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 16 }} />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#22c55e',
                                    fontWeight: 600,
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  Submitted Successfully!
                                </Typography>
                              </motion.div>
                            ) : (
                              <Button
                                size="small"
                                startIcon={<StarIcon />}
                                onClick={() => setRatingDialog({ open: true, book, rating: 0, review: '' })}
                                sx={{ color: darkMode ? '#94a3b8' : '#666' }}
                              >
                                Rate
                              </Button>
                            )}
                          </Box>
                        </Box>

                        <Box mt={2} position="relative" minHeight={40}>
                          <AnimatePresence>
                            {borrowedId === book._id ? (
                              <motion.div
                                key="borrowed"
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.7, opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px',
                                  padding: '8px',
                                  backgroundColor: darkMode ? 'rgba(67, 160, 71, 0.1)' : 'rgba(67, 160, 71, 0.1)',
                                  borderRadius: '8px',
                                  border: `1px solid ${darkMode ? '#43a047' : '#43a047'}`
                                }}
                              >
                                <CheckCircleIcon sx={{ color: '#43a047', fontSize: 24 }} />
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: '#43a047',
                                    fontWeight: 600
                                  }}
                                >
                                  Book Borrowed!
                                </Typography>
                              </motion.div>
                            ) : (
                              <motion.div key="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <Button
                                  variant="contained"
                                  sx={{
                                    borderRadius: 2,
                                    fontWeight: 600,
                                    width: '100%',
                                    background: darkMode
                                      ? 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)'
                                      : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                    '&:hover': {
                                      background: darkMode
                                        ? 'linear-gradient(45deg, #5855eb 30%, #7c3aed 90%)'
                                        : 'linear-gradient(45deg, #1976D2 30%, #1565C0 90%)'
                                    }
                                  }}
                                  disabled={book.copiesAvailable < 1}
                                  onClick={() => handleBorrow(book._id)}
                                >
                                  {book.copiesAvailable > 0 ? 'Borrow' : 'Unavailable'}
                                </Button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Fade>

      {/* Rating Dialog */}
      <Dialog
        open={ratingDialog.open}
        onClose={() => setRatingDialog({ open: false, book: null, rating: 0, review: '' })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: darkMode ? '#1e293b' : '#fff',
            color: darkMode ? '#fff' : '#333'
          }
        }}
      >
        <DialogTitle sx={{ color: 'inherit' }}>
          Rate: {ratingDialog.book?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'inherit' }}>
                Your Rating
              </Typography>
              <Rating
                value={ratingDialog.rating}
                onChange={(event, newValue) => {
                  setRatingDialog(prev => ({ ...prev, rating: newValue || 0 }));
                }}
                size="large"
                sx={{
                  '& .MuiRating-iconFilled': {
                    color: darkMode ? '#fbbf24' : '#ff9800'
                  }
                }}
              />
            </Box>

            <TextField
              fullWidth
              label="Review (Optional)"
              multiline
              rows={4}
              value={ratingDialog.review}
              onChange={(e) => setRatingDialog(prev => ({ ...prev, review: e.target.value }))}
              placeholder="Share your thoughts about this book..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: darkMode ? '#fff' : '#333',
                  '& fieldset': {
                    borderColor: darkMode ? '#475569' : '#ddd',
                  },
                  '&:hover fieldset': {
                    borderColor: darkMode ? '#64748b' : '#999',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: darkMode ? '#94a3b8' : '#666',
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRatingDialog({ open: false, book: null, rating: 0, review: '' })}
            sx={{ color: darkMode ? '#94a3b8' : '#666' }}
          >
            Cancel
          </Button>
          <Button
            onClick={submitRating}
            variant="contained"
            disabled={!ratingDialog.rating}
            sx={{
              background: darkMode
                ? 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)'
                : '#1976d2',
              '&:hover': {
                background: darkMode
                  ? 'linear-gradient(45deg, #5855eb 30%, #7c3aed 90%)'
                  : '#1565c0'
              }
            }}
          >
            Submit Rating
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 