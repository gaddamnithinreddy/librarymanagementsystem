import React, { useEffect, useState } from 'react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const adminToken = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!adminToken) {
      setError('Admin login required.');
      setLoading(false);
      return;
    }
    fetch('http://localhost:3001/admin/users', { headers: { token: adminToken } })
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setBorrows(data.borrows || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load users');
        setLoading(false);
      });
  }, [adminToken]);

  if (!adminToken) return <div>Admin login required.</div>;
  if (loading) return <div>Loading users...</div>;
  return (
    <div>
      <h2>All Users & Borrowing History</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <ul>
        {users.map(user => (
          <li key={user._id}>
            <b>{user.firstName} {user.lastName}</b> ({user.email})
            <ul>
              {borrows.filter(b => b.userId === user._id).map(borrow => (
                <li key={borrow._id}>
                  Book: {borrow.bookId} | Due: {new Date(borrow.dueDate).toLocaleDateString()} | {borrow.returnDate ? `Returned: ${new Date(borrow.returnDate).toLocaleDateString()}` : 'Not returned'} | Fine: {borrow.fine}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
} 