import axios from 'axios';

const API_BASE = process.env.API_BASE || 'http://localhost:3001/api';

describe('Moderation Tests', () => {
  test('Should reject unsafe content', async () => {
    const response = await axios.post(`${API_BASE}/tickets`, {
      email: 'test@example.com',
      subject: 'Test',
      message: 'This is a test message with inappropriate content that should be blocked',
    }).catch(err => err.response);

    expect(response.status).toBe(400);
    expect(response.data.allowed).toBe(false);
    expect(response.data.reasons).toBeDefined();
    expect(Array.isArray(response.data.reasons)).toBe(true);
  }, 30000);

  test('Should accept normal content', async () => {
    const response = await axios.post(`${API_BASE}/tickets`, {
      email: 'user@example.com',
      subject: 'Refund request',
      message: 'I was charged twice yesterday on my annual plan. Can I get a refund?',
    });

    expect(response.status).toBe(200);
    expect(response.data.ticketId).toBeDefined();
    expect(response.data.status).toBeDefined();
  }, 30000);
});

