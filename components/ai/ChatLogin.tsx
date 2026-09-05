import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/context/StoreContext';

export const ChatLogin = ({ onAuthSuccess }: { onAuthSuccess: (accessToken?: string) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();
  const { fetchCart, fetchWishlist } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User';
        await register(firstName, lastName, email, password);
      }
      
      // Refresh cart and wishlist in global store
      if (fetchCart) await fetchCart();
      if (fetchWishlist) await fetchWishlist();

      onAuthSuccess(localStorage.getItem('accessToken') || undefined);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
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
