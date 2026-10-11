const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Category = require('../src/models/Category');

let adminToken;

beforeAll(async () => {
  const url = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/grocery_test_db';
  await mongoose.connect(url);
  
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
  });
  
  const res = await request(app).post('/auth/login').send({
    email: 'admin@example.com',
    password: 'password123'
  });

  adminToken = res.body.data.token;
});

afterEach(async () => {
  await Category.deleteMany();
});

afterAll(async () => {
  await User.deleteMany();
  await mongoose.connection.close();
});

describe('Category Endpoints', () => {
  it('should allow admin to create category', async () => {
    const res = await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Fruits' });

    expect(res.statusCode).toEqual(201);
    expect(res.body.data.name).toBe('Fruits');
  });

  it('should deny non-authenticated requests to create category', async () => {
    const res = await request(app)
      .post('/categories')
      .send({ name: 'Vegetables' });

    expect(res.statusCode).toEqual(401);
  });
});
