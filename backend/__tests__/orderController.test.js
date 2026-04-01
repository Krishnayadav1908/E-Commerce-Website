jest.mock('../models/orderModel', () => jest.fn());
jest.mock('../models/productModel', () => ({
  findById: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
}));
jest.mock('../models/userModels', () => ({
  findById: jest.fn(),
}));
jest.mock('../utils/email', () => ({
  sendEmail: jest.fn(),
}));
jest.mock('../utils/validation', () => ({
  isValidEmail: jest.fn(),
}));

const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModels');
const { isValidEmail } = require('../utils/validation');
const orderController = require('../controller/orderController');

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('orderController.createOrder', () => {
  let saveMock;

  beforeEach(() => {
    jest.clearAllMocks();

    saveMock = jest.fn().mockResolvedValue(undefined);
    Order.mockImplementation(function OrderMock(doc) {
      Object.assign(this, doc);
      this._id = 'order-123';
      this.save = saveMock;
    });

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });
    isValidEmail.mockReturnValue(false);
  });

  it('returns 400 when products array is empty', async () => {
    const req = { body: { userId: 'u1', products: [] } };
    const res = createMockRes();

    await orderController.createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Products array is required and cannot be empty' });
  });

  it('returns 404 when product is not found', async () => {
    const req = {
      body: {
        userId: 'u1',
        products: [{ id: 11, quantity: 1 }],
      },
    };
    const res = createMockRes();

    Product.findOne.mockResolvedValue(null);

    await orderController.createOrder(req, res);

    expect(Product.findOne).toHaveBeenCalledWith({ id: 11 });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Product 11 not found' });
  });

  it('returns 400 when atomic stock deduction fails', async () => {
    const req = {
      body: {
        userId: 'u1',
        products: [{ id: 11, quantity: 3 }],
      },
    };
    const res = createMockRes();

    Product.findOne.mockResolvedValue({ _id: 'p1', title: 'Phone', stock: 2 });
    Product.findOneAndUpdate.mockResolvedValue(null);

    await orderController.createOrder(req, res);

    expect(Product.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'p1', stock: { $gte: 3 } },
      { $inc: { stock: -3 } },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Insufficient stock for Phone. Available: 2, Required: 3',
    });
  });

  it('creates order successfully when stock update succeeds', async () => {
    const req = {
      body: {
        userId: 'u1',
        products: [{ id: 11, title: 'Phone', quantity: 1 }],
        totalPrice: 1000,
        totalProducts: 1,
        date: '2026-03-23',
        address: { city: 'Delhi' },
        paymentMethod: 'card',
        paymentStatus: 'paid',
      },
    };
    const res = createMockRes();

    Product.findOne.mockResolvedValue({ _id: 'p1', title: 'Phone', stock: 10 });
    Product.findOneAndUpdate.mockResolvedValue({ _id: 'p1', stock: 9 });

    await orderController.createOrder(req, res);

    expect(Order).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'u1',
      totalPrice: 1000,
      status: 'paid',
      paymentStatus: 'paid',
    }));
    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      _id: 'order-123',
      status: 'paid',
    }));
  });
});
