import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export const ChatLogin = ({ onAuthSuccess }: { onAuthSuccess: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email, password } 
        : { name, email, password };
        
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        localStorage.setItem('accessToken', data.data.accessToken);
        window.dispatchEvent(new Event('storage'));
        onAuthSuccess();
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4 my-2 max-w-[400px]">
      <h4 className="text-white font-semibold mb-3">{isLogin ? 'Login to continue' : 'Create an account'}</h4>
      
      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-2 rounded mb-3">{error}</div>}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {!isLogin && (
          <input 
            type="text" 
            placeholder="Full Name" 
            value={name}
            onChange={e => setName(e.target.value)}
            className="bg-neutral-800 border border-neutral-700 text-white text-sm rounded px-3 py-2 focus:border-gold-500 outline-none"
            required 
          />
        )}
        <input 
          type="email" 
          placeholder="Email Address" 
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="bg-neutral-800 border border-neutral-700 text-white text-sm rounded px-3 py-2 focus:border-gold-500 outline-none"
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="bg-neutral-800 border border-neutral-700 text-white text-sm rounded px-3 py-2 focus:border-gold-500 outline-none"
          required 
        />
        
        <button 
          type="submit" 
          disabled={loading}
          className="bg-gold-600 hover:bg-gold-500 text-black font-semibold text-sm rounded py-2 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : (isLogin ? 'Login' : 'Register')}
        </button>
      </form>
      
      <button 
        onClick={() => setIsLogin(!isLogin)}
        className="text-neutral-400 hover:text-white text-xs mt-3 w-full text-center transition-colors"
      >
        {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
      </button>
    </div>
  );
};
