import { apiFetch } from './apiFetch';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export type TicketCategory = 
  | 'DAMAGED_PRODUCT'
  | 'WRONG_ITEM'
  | 'DELIVERY_ISSUE'
  | 'PAYMENT_REFUND'
  | 'QUALITY_ISSUE'
  | 'GENERAL_INQUIRY'
  | 'OTHER';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type SenderType = 'USER' | 'ADMIN';

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderType: SenderType;
  senderId: string;
  message: string;
  attachments: string[];
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  orderId?: string;
  productId?: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  description: string;
  attachments: string[];
  adminResponse?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  messages?: TicketMessage[];
  order?: { id: string; orderNumber: string; totalAmount: number; status: string; createdAt: string };
  product?: { id: string; title: string; images: string[]; slug: string };
}

export const supportAPI = {
  createTicket: async (data: {
    subject: string;
    description: string;
    category: TicketCategory;
    priority?: TicketPriority;
    orderId?: string;
    productId?: string;
    attachments?: string[];
  }) => {
    const response = await apiFetch(`${API_BASE_URL}/support/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getMyTickets: async () => {
    const response = await apiFetch(`${API_BASE_URL}/support/tickets/my-tickets`);
    return response.json();
  },

  getTicketDetails: async (id: string) => {
    const response = await apiFetch(`${API_BASE_URL}/support/tickets/${id}`);
    return response.json();
  },

  addReply: async (id: string, message: string, attachments: string[] = []) => {
    const response = await apiFetch(`${API_BASE_URL}/support/tickets/${id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, attachments }),
    });
    return response.json();
  }
};
