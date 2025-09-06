"use client";

import { useState, useEffect } from 'react';

interface Password {
  id: string;
  service: string;
  username: string;
  password?: string;
}

export default function PasswordManager() {
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [service, setService] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPassword, setEditingPassword] = useState<Password | null>(null);

  useEffect(() => {
    fetchPasswords();
  }, []);

  const fetchPasswords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/passwords');
      if (!response.ok) {
        throw new Error('Failed to fetch passwords');
      }
      const data = await response.json();
      setPasswords(data);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const addPassword = async () => {
    try {
      const response = await fetch('/api/passwords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, username, password }),
      });
      if (!response.ok) {
        throw new Error('Failed to add password');
      }
      setService('');
      setUsername('');
      setPassword('');
      fetchPasswords();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  const updatePassword = async () => {
    if (!editingPassword) return;
    try {
      const response = await fetch(`/api/passwords`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPassword.id,
          service,
          username,
          password,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update password');
      }
      setService('');
      setUsername('');
      setPassword('');
      setEditingPassword(null);
      fetchPasswords();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPassword) {
      updatePassword();
    } else {
      addPassword();
    }
  };

  const startEditing = (p: Password) => {
    setEditingPassword(p);
    setService(p.service);
    setUsername(p.username);
    setPassword(''); // Don't show old password
  };

  const cancelEditing = () => {
    setEditingPassword(null);
    setService('');
    setUsername('');
    setPassword('');
  };

  const viewPassword = async (id: string) => {
    try {
      const response = await fetch(`/api/passwords?id=${id}`);
      if (!response.ok) {
        throw new Error('Failed to retrieve password');
      }
      const { password: decryptedPassword } = await response.json();
      setPasswords(passwords.map(p => p.id === id ? { ...p, password: decryptedPassword } : p));
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred');
        }
    }
  };

  const deletePassword = async (id: string) => {
    try {
      const response = await fetch(`/api/passwords?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete password');
      }
      fetchPasswords();
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred');
        }
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      <h2>Password Manager</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Service"
          value={service}
          onChange={(e) => setService(e.target.value)}
          required
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button type="submit" style={{ padding: '5px 10px' }}>
          {editingPassword ? 'Update Password' : 'Add Password'}
        </button>
        {editingPassword && (
          <button type="button" onClick={cancelEditing} style={{ marginLeft: '10px', padding: '5px 10px' }}>
            Cancel
          </button>
        )}
      </form>
      {loading ? <p>Loading...</p> : (
        <ul>
          {passwords.map((p) => (
            <li key={p.id} style={{ marginBottom: '10px', listStyle: 'none' }}>
              <strong>{p.service}</strong> ({p.username})
              {p.password ? (
                <span style={{ marginLeft: '10px' }}>{p.password}</span>
              ) : (
                <button onClick={() => viewPassword(p.id)} style={{ marginLeft: '10px' }}>View</button>
              )}
              <button onClick={() => startEditing(p)} style={{ marginLeft: '10px' }}>Edit</button>
              <button onClick={() => deletePassword(p.id)} style={{ marginLeft: '10px', color: 'red' }}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}