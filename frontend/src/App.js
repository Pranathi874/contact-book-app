import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const initialForm = { name: '', email: '', phone: '' };

function App() {
  const [form, setForm] = useState(initialForm);
  const [contacts, setContacts] = useState([]);
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/contacts?page=${page}&limit=${limit}`).then(res => {
      setContacts(res.data.contacts);
      setTotal(res.data.total);
    });
  }, [page]);

  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = 'Name is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Invalid email.';
    if (!/^\d{10}$/.test(form.phone)) newErrors.phone = '10 digits required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    await axios.post(`${process.env.REACT_APP_API_URL}/contacts`, form);
    setForm(initialForm);
    setPage(1);
    // Refetch first page after add
    axios.get(`${process.env.REACT_APP_API_URL}/contacts?page=1&limit=${limit}`).then(res => {
      setContacts(res.data.contacts);
      setTotal(res.data.total);
    });
  };

  const handleDelete = id => {
    axios.delete(`${process.env.REACT_APP_API_URL}/contacts/${id}`).then(() => {
      setContacts(contacts.filter(c => c.id !== id));
      setTotal(total - 1);
    });
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container" style={{ maxWidth: 480, margin: 'auto' }}>
      <h2>Contact Book</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input placeholder="Name" name="name" value={form.name} onChange={handleChange} />
        {errors.name && <span style={{ color: 'red' }}>{errors.name}</span>}
        <input placeholder="Email" name="email" value={form.email} onChange={handleChange} />
        {errors.email && <span style={{ color: 'red' }}>{errors.email}</span>}
        <input placeholder="Phone (10-digit)" name="phone" value={form.phone} onChange={handleChange} />
        {errors.phone && <span style={{ color: 'red' }}>{errors.phone}</span>}
        <button type="submit">Add Contact</button>
      </form>
      <ul>
        {contacts.map(c => (
          <li key={c.id} style={{ margin: 8, borderBottom: '1px solid #ccc', padding: 8 }}>
            <b>{c.name}</b> <br />
            {c.email} <br />
            {c.phone} <br />
            <button onClick={() => handleDelete(c.id)} style={{ color: 'red' }}>Delete</button>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 16 }}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
        <span style={{ margin: '0 8px' }}>Page {page}/{totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}

export default App;
