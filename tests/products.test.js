const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');

let adminToken;
let userToken;
let testCategory;

beforeAll(async () => {
  const url = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/grocery_test_db';
  await mongoose.connect(url);

  // Create Admin
  await request(app).post('/auth/register').send({
    name: 'Admin User',
    email: 'admin_prod@example.com',
    password: 'password123',
    role: 'admin'
  });

  const adminLogin = await request(app).post('/auth/login').send({
    email: 'admin_prod@example.com',
    password: 'password123'
  });
  adminToken = adminLogin.body.data.token;

  // Create Regular User
  await request(app).post('/auth/register').send({
    name: 'Regular User',
    email: 'user_prod@example.com',
    password: 'password123',
    role: 'user'
  });

  const userLogin = await request(app).post('/auth/login').send({
    email: 'user_prod@example.com',
    password: 'password123'
  });
  userToken = userLogin.body.data.token;
});

beforeEach(async () => {
  testCategory = await Category.create({ name: 'Dairy' });
});

afterEach(async () => {
  await Product.deleteMany();
  await Category.deleteMany();
});

afterAll(async () => {
  await User.deleteMany();
  await mongoose.connection.close();
});

describe('Product Endpoints', () => {
  describe('POST /products', () => {
    it('should allow admin to create a new product', async () => {
      const res = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Fresh Milk',
          price: 3.99,
          stock: 50,
          category: testCategory._id.toString()
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.name).toBe('Fresh Milk');
    });

    it('should reject product creation by non-admin user', async () => {
      const res = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Fresh Milk',
          price: 3.99,
          stock: 50,
          category: testCategory._id.toString()
        });

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toBe(false);
    });

    it('should fail validation if required fields are missing', async () => {
      const res = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Incomplete Product'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /products', () => {
    it('should fetch paginated list of products', async () => {
      await Product.create([
        { name: 'Cheese', price: 5.00, stock: 20, category: testCategory._id },
        { name: 'Butter', price: 2.50, stock: 15, category: testCategory._id }
      ]);

      const res = await request(app)
        .get('/products?page=1&limit=1')
        .send();

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products.length).toBe(1);
      expect(res.body.data.pagination).toEqual({
        total: 2,
        page: 1,
        pages: 2
      });
    });
  });

  describe('GET /products/:id', () => {
    it('should fetch product details by valid ID', async () => {
      const product = await Product.create({
        name: 'Yogurt',
        price: 1.99,
        stock: 30,
        category: testCategory._id
      });

      const res = await request(app)
        .get(`/products/${product._id}`)
        .send();

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Yogurt');
    });

    it('should return 404 for non-existent product ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/products/${fakeId}`)
        .send();

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
    });
  });
});
