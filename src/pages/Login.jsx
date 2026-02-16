import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../index.css'; // Make sure to import styles if needed

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password.trim()) {
            setError('Please fill in all fields.');
            return;
        }

        const success = login(email, password, rememberMe);
        if (success) {
            navigate('/board');
        } else {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#1a1a1a', // Match theme background
            color: '#fff'
        }}>
            <div style={{
                background: '#2a2a2a',
                padding: '2rem',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: 0 }}>Login</h2>
                {error && <div style={{ color: '#ff6b6b', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="intern@demo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                paddingRight: '2.5rem', // Accommodate browser autofill icons
                                borderRadius: '4px',
                                border: '1px solid #444',
                                background: '#333',
                                color: '#fff',
                                fontSize: '1rem',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="intern123"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                borderRadius: '4px',
                                border: '1px solid #444',
                                background: '#333',
                                color: '#fff',
                                fontSize: '1rem',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            style={{ cursor: 'pointer' }}
                        />
                        <label htmlFor="rememberMe" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>Remember Me</label>
                    </div>
                    <button
                        type="submit"
                        style={{
                            padding: '0.8rem',
                            borderRadius: '4px',
                            border: 'none',
                            background: '#646cff',
                            color: '#fff',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            fontWeight: '600',
                            marginTop: '0.5rem',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#535bf2'}
                        onMouseOut={(e) => e.target.style.background = '#646cff'}
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
