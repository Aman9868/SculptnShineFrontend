import { useState } from 'react';
import { authAPI } from '@/lib/api/auth';

const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam',
  'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

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
  const [mobile, setMobile] = useState('');
  
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

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('Enter a valid 10-digit Indian mobile number');
      setLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/addresses`, {
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
        const profile = await authAPI.getProfile();
        await authAPI.updateProfile(profile.data.id, { phone: mobile });
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
    <div className="bg-[#151515] rounded-2xl p-4 sm:p-5 my-2 border border-neutral-800 shadow-2xl shadow-black/30 max-w-sm mx-auto">
      <h3 className="text-lg font-bold text-white mb-4 tracking-tight">Add Delivery Address</h3>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm p-2.5 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1">Flat / House No.</label>
          <input
            type="text"
            required
            className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30"
            value={flatHouse}
            onChange={e => setFlatHouse(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1">Area / Street</label>
          <input
            type="text"
            required
            className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30"
            value={areaStreet}
            onChange={e => setAreaStreet(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1">Landmark (Optional)</label>
          <input
            type="text"
            className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30"
            value={landmark}
            onChange={e => setLandmark(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Pincode</label>
            <input
              type="text"
              required
              className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30"
              value={pincode}
              onChange={e => setPincode(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">City</label>
            <input
              type="text"
              required
              className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30"
              value={townCity}
              onChange={e => setTownCity(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1">Mobile Number (Required)</label>
          <input
            type="tel"
            required
            inputMode="numeric"
            maxLength={10}
            pattern="[6-9][0-9]{9}"
            placeholder="10-digit mobile number"
            className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30"
            value={mobile}
            onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1">State</label>
          <select
            required
            className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30"
            value={stateName}
            onChange={e => setStateName(e.target.value)}
          >
            <option value="">Select state</option>
            {INDIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gold-500 hover:bg-gold-400 text-black font-bold py-2.5 px-4 rounded-lg transition-colors mt-2 shadow-lg shadow-gold-500/10 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Address'}
        </button>
      </form>
    </div>
  );
}
