const express = require('express');
const request = require('supertest');

jest.mock('../models/productModel', () => ({
  find: jest.fn(),
  countDocuments: jest.fn(),
}));

jest.mock('../utils/cache', () => ({
  get: jest.fn(),
  set: jest.fn(),
}));

const Product = require('../models/productModel');
const cache = require('../utils/cache');
const productsRouter = require('../routes/products');

const createQueryChain = (items) => {
  const chain = {
    select: jest.fn().mockReturnThis(),
    hint: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(items),
  };
  return chain;
};

describe('GET /api/products', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/products', productsRouter);
    jest.clearAllMocks();
  });

  it('returns cached result with X-Cache HIT', async () => {
    cache.get.mockReturnValue({
      items: [{ id: 1, title: 'Cached Product' }],
      total: 1,
      page: 1,
      limit: 24,
      hasMore: false,
    });

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.headers['x-cache']).toBe('HIT');
    expect(Product.find).not.toHaveBeenCalled();
    expect(res.body.items).toHaveLength(1);
  });

  it('queries DB and caches response when cache MISS', async () => {
    cache.get.mockReturnValue(null);
    const items = [
      { id: 1, title: 'Phone', price: 1000, category: 'electronics', stock: 5 },
    ];

    Product.find.mockReturnValue(createQueryChain(items));
    Product.countDocuments.mockResolvedValue(1);

    const res = await request(app).get('/api/products?page=1&limit=12&category=electronics');

    expect(res.status).toBe(200);
    expect(res.headers['x-cache']).toBe('MISS');
    expect(Product.find).toHaveBeenCalledTimes(1);
    expect(Product.countDocuments).toHaveBeenCalledTimes(1);
    expect(cache.set).toHaveBeenCalledTimes(1);
    expect(res.body.total).toBe(1);
    expect(res.body.items[0].title).toBe('Phone');
  });
});
