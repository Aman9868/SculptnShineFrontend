// User Profile Types
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  bio?: string | null;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

// Address Types
export interface Address {
  id: string;
  userId: string;
  flatHouse: string;
  areaStreet: string;
  landmark?: string | null;
  pincode: string;
  townCity: string;
  state: string;
  deliveryInstructions?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressRequest {
  flatHouse: string;
  areaStreet: string;
  landmark?: string;
  pincode: string;
  townCity: string;
  state: string;
  deliveryInstructions?: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  flatHouse?: string;
  areaStreet?: string;
  landmark?: string;
  pincode?: string;
  townCity?: string;
  state?: string;
  deliveryInstructions?: string;
  isDefault?: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: Gender;
  bio?: string;
  profileImage?: string;
}
