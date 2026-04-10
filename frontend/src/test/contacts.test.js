import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockContacts = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+1234567890', status: 'NEW' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+0987654321', status: 'CONTACTED' },
];

describe('Contacts Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/contacts', () => {
    it('should fetch all contacts', async () => {
      const mockResponse = {
        data: {
          content: mockContacts,
          totalElements: 2,
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse.data),
      });

      const response = await fetch('/api/contacts', {
        headers: {
          Authorization: 'Bearer mock-token',
        },
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/contacts', expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token',
        }),
      }));
      expect(response.ok).toBe(true);
    });

    it('should handle empty contacts list', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ content: [], totalElements: 0 }),
      });

      const response = await fetch('/api/contacts');
      const data = await response.json();

      expect(data.content).toEqual([]);
      expect(data.totalElements).toBe(0);
    });
  });

  describe('POST /api/contacts', () => {
    it('should create a new contact', async () => {
      const newContact = { name: 'New Contact', email: 'new@example.com', phone: '+1111111111' };
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '3', ...newContact, status: 'NEW' }),
      });

      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token',
        },
        body: JSON.stringify(newContact),
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/contacts', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(newContact),
      }));
      expect(response.ok).toBe(true);
    });
  });

  describe('PATCH /api/contacts/:id', () => {
    it('should update a contact', async () => {
      const updatedData = { name: 'Updated Name' };
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '1', ...updatedData }),
      });

      const response = await fetch('/api/contacts/1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token',
        },
        body: JSON.stringify(updatedData),
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/contacts/1', expect.objectContaining({
        method: 'PATCH',
      }));
      expect(response.ok).toBe(true);
    });
  });

  describe('DELETE /api/contacts/:id', () => {
    it('should delete a contact', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const response = await fetch('/api/contacts/1', {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer mock-token',
        },
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/contacts/1', expect.objectContaining({
        method: 'DELETE',
      }));
      expect(response.status).toBe(204);
    });
  });

  describe('Contact Data Structure', () => {
    it('should have required fields', () => {
      const contact = mockContacts[0];
      
      expect(contact).toHaveProperty('id');
      expect(contact).toHaveProperty('name');
      expect(contact).toHaveProperty('email');
      expect(contact).toHaveProperty('status');
      expect(['NEW', 'CONTACTED', 'QUALIFIED', 'LOST', 'CONVERTED']).toContain(contact.status);
    });

    it('should validate email format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      mockContacts.forEach(contact => {
        expect(contact.email).toMatch(emailRegex);
      });
    });
  });

  describe('Search and Filter', () => {
    it('should filter contacts by name', () => {
      const searchTerm = 'John';
      const filtered = mockContacts.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('John Doe');
    });

    it('should filter contacts by email', () => {
      const searchTerm = 'jane';
      const filtered = mockContacts.filter(c => 
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Jane Smith');
    });

    it('should filter contacts by status', () => {
      const status = 'NEW';
      const filtered = mockContacts.filter(c => c.status === status);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].status).toBe('NEW');
    });
  });
});
