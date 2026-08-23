import { useState } from 'react';

interface ChatAddressProps {
  onSuccess: () => void;
}

export default function ChatAddress({ onSuccess }: ChatAddressProps) {
  const [flatHouse, setFlatHouse] = useState('');
  const [areaStreet, setAreaStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [townCity, setTownCity] = useState('');
  const [stateName, setStateName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          flatHouse,
          areaStreet,
          landmark,
          pincode,
          townCity,
          state: stateName
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        onSuccess();
      } else {
        setError(data.message || 'Failed to add address');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 my-2 border border-slate-700 shadow-xl max-w-sm mx-auto">
      <h3 className="text-lg font-bold text-white mb-4">Add Delivery Address</h3>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 text-sm p-2 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Flat / House No.</label>
          <input
            type="text"
            required
            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            value={flatHouse}
            onChange={e => setFlatHouse(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Area / Street</label>
          <input
            type="text"
            required
            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            value={areaStreet}
            onChange={e => setAreaStreet(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Landmark (Optional)</label>
          <input
            type="text"
            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            value={landmark}
            onChange={e => setLandmark(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Pincode</label>
            <input
              type="text"
              required
              className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              value={pincode}
              onChange={e => setPincode(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">City</label>
            <input
              type="text"
              required
              className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              value={townCity}
              onChange={e => setTownCity(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">State</label>
          <input
            type="text"
            required
            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            value={stateName}
            onChange={e => setStateName(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors mt-2"
        >
          {loading ? 'Saving...' : 'Save Address'}
        </button>
      </form>
    </div>
  );
}
