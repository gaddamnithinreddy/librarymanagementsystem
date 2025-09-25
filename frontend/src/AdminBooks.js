import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeContext';
import API_BASE_URL from './config';

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ title: '', author: '', description: '', isbn: '', imageUrl: '', category: 'General', totalCopies: 1 });
  const [editId, setEditId] = useState(null);
  const [actionDone, setActionDone] = useState(false);
  const adminToken = localStorage.getItem('adminToken');
  const { darkMode, theme } = useTheme();

  useEffect(() => {
    const fetchBooks = () => {
      setLoading(true);
      fetch(`${API_BASE_URL}/admin/books`, { headers: { token: adminToken } })
        .then(res => res.json())
        .then(data => {
          setBooks(data.books || []);
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to load books');
          setLoading(false);
        });
    };

    fetchBooks();
  }, [adminToken]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async e => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/admin/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', token: adminToken },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Book added');
        setForm({ title: '', author: '', description: '', isbn: '', imageUrl: '', category: 'General', totalCopies: 1 });
        setActionDone('add');
        setTimeout(() => setActionDone(false), 1200);
      } else setError(data.message || 'Add failed');
    } catch { setError('Network error'); }
  };

  const handleEdit = book => {
    setEditId(book._id);
    setForm({ ...book });
  };

  const handleUpdate = async e => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/admin/book`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', token: adminToken },
        body: JSON.stringify({ ...form, bookId: editId })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Book updated');
        setEditId(null);
        setForm({ title: '', author: '', description: '', isbn: '', imageUrl: '', category: 'General', totalCopies: 1 });
        setActionDone('edit');
        setTimeout(() => setActionDone(false), 1200);
      } else setError(data.message || 'Update failed');
    } catch { setError('Network error'); }
  };

  const handleDelete = async id => {
    setError(''); setMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/admin/book`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', token: adminToken },
        body: JSON.stringify({ bookId: id })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Book deleted');
        setActionDone('delete');
        setTimeout(() => setActionDone(false), 1200);
      }
      else setError(data.message || 'Delete failed');
    } catch { setError('Network error'); }
  };

  if (!adminToken) return <div style={{ color: darkMode ? '#fff' : '#000' }}>Admin login required.</div>;
  if (loading) return <div style={{ color: darkMode ? '#fff' : '#000' }}>Loading books...</div>;
  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 6 }}>
      <Card elevation={0} sx={{
        background: darkMode
          ? 'linear-gradient(145deg, #232526 0%, #414345 100%)'
          : 'rgba(255,255,255,0.85)',
        boxShadow: darkMode
          ? '0 8px 32px 0 rgba(255,165,0,0.15)'
          : '0 4px 32px 0 rgba(80,120,255,0.07)',
        backdropFilter: 'blur(8px)',
        borderRadius: 4,
        p: 3,
        mb: 4,
        border: darkMode ? '1px solid rgba(255,165,0,0.3)' : 'none'
      }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} sx={{
            color: darkMode ? '#ffa500' : theme.palette.primary.main,
            mb: 2
          }}>
            Admin Book Management
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          <form onSubmit={editId ? handleUpdate : handleAdd}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="title"
                  label="Title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: darkMode ? '#fff' : 'inherit',
                      '& fieldset': {
                        borderColor: darkMode ? '#ffa500' : 'rgba(0, 0, 0, 0.23)',
                      },
                      '&:hover fieldset': {
                        borderColor: darkMode ? '#ffb347' : 'rgba(0, 0, 0, 0.87)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: darkMode ? '#ffa500' : theme.palette.primary.main,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: darkMode ? '#ffa500' : 'rgba(0, 0, 0, 0.6)',
                      '&.Mui-focused': {
                        color: darkMode ? '#ffa500' : theme.palette.primary.main,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="author"
                  label="Author"
                  value={form.author}
                  onChange={handleChange}
                  required
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: darkMode ? '#fff' : 'inherit',
                      '& fieldset': {
                        borderColor: darkMode ? '#ffa500' : 'rgba(0, 0, 0, 0.23)',
                      },
                      '&:hover fieldset': {
                        borderColor: darkMode ? '#ffb347' : 'rgba(0, 0, 0, 0.87)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: darkMode ? '#ffa500' : theme.palette.primary.main,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: darkMode ? '#ffa500' : 'rgba(0, 0, 0, 0.6)',
                      '&.Mui-focused': {
                        color: darkMode ? '#ffa500' : theme.palette.primary.main,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  value={form.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  minRows={2}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: darkMode ? '#fff' : 'inherit',
                      '& fieldset': {
                        borderColor: darkMode ? '#ffa500' : 'rgba(0, 0, 0, 0.23)',
                      },
                      '&:hover fieldset': {
                        borderColor: darkMode ? '#ffb347' : 'rgba(0, 0, 0, 0.87)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: darkMode ? '#ffa500' : theme.palette.primary.main,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: darkMode ? '#ffa500' : 'rgba(0, 0, 0, 0.6)',
                      '&.Mui-focused': {
                        color: darkMode ? '#ffa500' : theme.palette.primary.main,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="isbn" label="ISBN" value={form.isbn} onChange={handleChange} required fullWidth variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    label="Category"
                  >
                    <MenuItem value="General">General</MenuItem>
                    <MenuItem value="Fiction">Fiction</MenuItem>
                    <MenuItem value="Non-Fiction">Non-Fiction</MenuItem>
                    <MenuItem value="Science">Science</MenuItem>
                    <MenuItem value="Technology">Technology</MenuItem>
                    <MenuItem value="History">History</MenuItem>
                    <MenuItem value="Biography">Biography</MenuItem>
                    <MenuItem value="Philosophy">Philosophy</MenuItem>
                    <MenuItem value="Art">Art</MenuItem>
                    <MenuItem value="Education">Education</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="imageUrl" label="Image URL" value={form.imageUrl} onChange={handleChange} fullWidth variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="totalCopies" label="Total Copies" type="number" min={1} value={form.totalCopies} onChange={handleChange} required fullWidth variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6} display="flex" alignItems="center" gap={2}>
                <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 600, borderRadius: 2, minWidth: 120 }}>
                  {editId ? 'Update' : 'Add'} Book
                </Button>
                {editId && (
                  <Button type="button" variant="outlined" color="secondary" onClick={() => { setEditId(null); setForm({ title: '', author: '', description: '', isbn: '', imageUrl: '', totalCopies: 1 }); }} sx={{ borderRadius: 2 }}>
                    Cancel
                  </Button>
                )}
                <AnimatePresence>
                  {actionDone && (
                    <motion.div
                      key="done"
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      style={{ marginLeft: 12 }}
                    >
                      <CheckCircleIcon sx={{ color: '#43a047', fontSize: 36 }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
      <Card elevation={0} sx={{
        background: darkMode
          ? 'linear-gradient(145deg, #232526 0%, #414345 100%)'
          : 'rgba(255,255,255,0.85)',
        boxShadow: darkMode
          ? '0 8px 32px 0 rgba(255,165,0,0.15)'
          : '0 4px 32px 0 rgba(80,120,255,0.07)',
        backdropFilter: 'blur(8px)',
        borderRadius: 4,
        p: 3,
        border: darkMode ? '1px solid rgba(255,165,0,0.3)' : 'none'
      }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={2} sx={{
            color: darkMode ? '#ffa500' : 'inherit'
          }}>Books List</Typography>
          {books.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Books Available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No books have been added to the library yet. Add your first book using the form above.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {books.map(book => (
                <Grid item xs={12} key={book._id}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" sx={{
                    p: 2,
                    borderRadius: 2,
                    background: darkMode
                      ? 'rgba(65,67,69,0.7)'
                      : 'rgba(245,245,255,0.7)',
                    boxShadow: darkMode
                      ? '0 2px 8px 0 rgba(255,165,0,0.1)'
                      : '0 2px 8px 0 rgba(80,120,255,0.04)',
                    border: darkMode ? '1px solid rgba(255,165,0,0.2)' : 'none'
                  }}>
                    <Box>
                      <Typography fontWeight={600} sx={{
                        color: darkMode ? '#fff' : 'inherit'
                      }}>{book.title}</Typography>
                      <Typography variant="body2" sx={{
                        color: darkMode ? '#cbd5e1' : 'text.secondary'
                      }}>by {book.author} (ISBN: {book.isbn})</Typography>
                      <Typography variant="body2" sx={{
                        color: darkMode ? '#cbd5e1' : 'text.secondary'
                      }}>Category: {book.category || 'General'}</Typography>
                      <Typography variant="body2" sx={{
                        color: darkMode ? '#cbd5e1' : 'text.secondary'
                      }}>Copies: {book.copiesAvailable}/{book.totalCopies}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconButton color="primary" onClick={() => handleEdit(book)}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(book._id)}><DeleteIcon /></IconButton>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  );
} 