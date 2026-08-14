'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { addressAPI } from '@/lib/api/address';
import { authAPI } from '@/lib/api/auth';
import { Address, CreateAddressRequest } from '@/types/address';
import { Edit2, Trash2, Home, Plus, X, Briefcase } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AddressesTab() {
  const { user, updateUser } = useAuth();

  const addresses = user?.addresses || [];
  const loading = !user;
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateAddressRequest>({
    flatHouse: '',
    areaStreet: '',
    landmark: '',
    pincode: '',
    townCity: '',
    state: '',
    deliveryInstructions: '',
    isDefault: false,
  });

  const refreshUser = async () => {
    try {
      const profileRes = await authAPI.getProfile();
      updateUser(profileRes.data);
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  const handleOpenModal = (address?: Address) => {
    if (address) {
      setEditingId(address.id);
      setFormData({
        flatHouse: address.flatHouse,
        areaStreet: address.areaStreet,
        landmark: address.landmark || '',
        pincode: address.pincode,
        townCity: address.townCity,
        state: address.state,
        deliveryInstructions: address.deliveryInstructions || '',
        isDefault: address.isDefault,
      });
    } else {
      setEditingId(null);
      setFormData({
        flatHouse: '',
        areaStreet: '',
        landmark: '',
        pincode: '',
        townCity: '',
        state: '',
        deliveryInstructions: '',
        isDefault: false,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      flatHouse: '',
      areaStreet: '',
      landmark: '',
      pincode: '',
      townCity: '',
      state: '',
      deliveryInstructions: '',
      isDefault: false,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSaveAddress = async () => {
    try {
      if (!user?.id) return;

      if (!formData.flatHouse || !formData.areaStreet || !formData.pincode || !formData.townCity || !formData.state) {
        toast.error('Please fill all required fields');
        return;
      }

      if (editingId) {
        await addressAPI.updateAddress(user.id, editingId, formData);
        toast.success('Address updated successfully');
      } else {
        await addressAPI.createAddress(user.id, formData);
        toast.success('Address added successfully');
      }

      await refreshUser();
      handleCloseModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      if (!user?.id) return;
      await addressAPI.deleteAddress(user.id, addressId);
      await refreshUser();
      toast.success('Address deleted successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete address');
    }
  };

  return (
    <div className="flex-1">
      {loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-600 mb-4">No addresses saved yet</p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 bg-gold-600 hover:bg-gold-700 text-white px-6 py-2 rounded-md font-medium transition"
          >
            <Plus size={20} />
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-start justify-between mb-8">
            <h2 className="text-2xl font-serif text-brandDark">Saved Addresses</h2>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-gold-600 hover:bg-gold-700 text-white px-6 py-2 rounded-md font-medium transition"
            >
              <Plus size={20} />
              Add New Address
            </button>
          </div>
          <div className="space-y-6">
            {addresses.map((address) => (
              <div key={address.id} className="border border-cream-200 rounded-lg p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                        {address.flatHouse.toLowerCase().includes('office') ? (
                          <Briefcase size={18} className="text-orange-500" />
                        ) : (
                          <Home size={18} className="text-orange-500" />
                        )}
                      </div>
                      <h3 className="text-base font-bold text-gray-900">
                        {address.flatHouse.toLowerCase().includes('home') ? 'Home' : address.flatHouse.toLowerCase().includes('office') ? 'Office' : address.flatHouse.toLowerCase().includes('parents') ? 'Parents Home' : 'Address'}
                      </h3>
                      {address.isDefault && (
                        <span className="bg-orange-100 text-orange-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ml-1">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(address)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 transition"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>

                <div className="text-gray-500 space-y-1 text-sm ml-[52px]">
                  <p className="text-gray-700">{address.flatHouse}</p>
                  <p>{address.areaStreet}</p>
                  {address.landmark && <p>Landmark: {address.landmark}</p>}
                  <p>Pincode: {address.pincode} • {address.townCity}, {address.state}</p>
                  {address.deliveryInstructions && (
                    <p>Delivery Instructions: {address.deliveryInstructions}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Address Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-cream-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-serif text-brandDark">
                {editingId ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brandDark mb-2">
                  Flat, House no., Building, Company, Apartment <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="flatHouse"
                  value={formData.flatHouse}
                  onChange={handleInputChange}
                  placeholder="e.g. Flat No. 101, Lotus Apartment"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brandDark mb-2">
                  Area, Street, Sector, Village <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="areaStreet"
                  value={formData.areaStreet}
                  onChange={handleInputChange}
                  placeholder="e.g. Sector 45, Near City Park"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brandDark mb-2">
                  Landmark <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  placeholder="e.g. Opposite Metro Station"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brandDark mb-2">
                    Pincode <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="e.g. 160044"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brandDark mb-2">
                    Town/City <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="townCity"
                    value={formData.townCity}
                    onChange={handleInputChange}
                    placeholder="e.g. Chandigarh"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brandDark mb-2">
                    State <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold-600"
                  >
                    <option value="">Select</option>
                    <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Assam">Assam</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Chandigarh">Chandigarh</option>
                    <option value="Chhattisgarh">Chhattisgarh</option>
                    <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Goa">Goa</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                    <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                    <option value="Jharkhand">Jharkhand</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Ladakh">Ladakh</option>
                    <option value="Lakshadweep">Lakshadweep</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Puducherry">Puducherry</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Sikkim">Sikkim</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Tripura">Tripura</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Uttarakhand">Uttarakhand</option>
                    <option value="West Bengal">West Bengal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brandDark mb-2">
                  Delivery instructions <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <textarea
                  name="deliveryInstructions"
                  value={formData.deliveryInstructions}
                  onChange={handleInputChange}
                  placeholder="e.g. Leave at the reception, Call upon arrival etc."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold-600"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  name="isDefault"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-gold-600 focus:ring-gold-600"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">
                  Set as default address
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-white">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAddress}
                className="px-6 py-2.5 bg-gold-600 hover:bg-gold-700 text-white rounded-lg font-bold text-sm transition"
              >
                {editingId ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
