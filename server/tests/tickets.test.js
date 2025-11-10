/**
 * Minimal tests for ticket submission pipeline
 * Run with: npm test
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-bearer-token-change-me';

const adminHeaders = {
  Authorization: `Bearer ${ADMIN_TOKEN}`,
};

describe('Ticket API', () => {
  let testTicketId;

  it('should create a ticket successfully', async () => {
    const response = await axios.post(`${API_BASE}/tickets`, {
      email: 'test@example.com',
      subject: 'Test ticket',
      message: 'This is a test message about a refund request.',
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('ticketId');
    expect(response.data).toHaveProperty('status');
    expect(['queued', 'answered']).toContain(response.data.status);
    
    testTicketId = response.data.ticketId;
  }, 30000);

  it('should reject ticket with missing fields', async () => {
    try {
      await axios.post(`${API_BASE}/tickets`, {
        email: 'test@example.com',
        // missing subject and message
      });
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });

  it('should list tickets (admin)', async () => {
    const response = await axios.get(`${API_BASE}/tickets`, {
      headers: adminHeaders,
    });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('should get ticket details (admin)', async () => {
    if (!testTicketId) {
      // Create a ticket first
      const createResponse = await axios.post(`${API_BASE}/tickets`, {
        email: 'test2@example.com',
        subject: 'Test ticket 2',
        message: 'Another test message.',
      });
      testTicketId = createResponse.data.ticketId;
    }

    const response = await axios.get(`${API_BASE}/tickets/${testTicketId}`, {
      headers: adminHeaders,
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id');
    expect(response.data).toHaveProperty('nlp');
    expect(response.data).toHaveProperty('rag');
    expect(response.data.nlp).toHaveProperty('intent');
    expect(response.data.nlp).toHaveProperty('confidence');
    expect(typeof response.data.nlp.confidence).toBe('number');
  }, 30000);
});

describe('KB API', () => {
  let testArticleId;

  it('should create KB article (admin)', async () => {
    const response = await axios.post(
      `${API_BASE}/kb`,
      {
        title: 'Test Article',
        body: 'This is a test knowledge base article.',
      },
      { headers: adminHeaders }
    );

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
    testArticleId = response.data.id;
  }, 30000);

  it('should search KB (admin)', async () => {
    const response = await axios.get(`${API_BASE}/kb/search`, {
      params: { q: 'test', k: 3 },
      headers: adminHeaders,
    });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  }, 30000);

  it('should require auth for admin endpoints', async () => {
    try {
      await axios.post(`${API_BASE}/kb`, {
        title: 'Test',
        body: 'Test',
      });
      expect(true).toBe(false);
    } catch (error) {
      expect([401, 403]).toContain(error.response.status);
    }
  });
});

