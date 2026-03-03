const User = require('../models/userModels');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const AdminActivity = require('../models/adminActivityModel');
const EmailLog = require('../models/emailLogModel');
const { sendEmail } = require('../utils/email');
const { isValidEmail } = require('../utils/validation');

exports.getStats = async (req, res) => {
  try {
    const [usersCount, ordersCount, productsCount, revenueAgg] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
      ])
    ]);

    const totalRevenue = revenueAgg?.[0]?.totalRevenue || 0;

    const recentOrders = await Order.find()
      .select('_id status totalPrice date paymentStatus')
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email')
      .lean();

    res.set('Cache-Control', 'public, max-age=300');
    res.json({
      usersCount,
      ordersCount,
      productsCount,
      totalRevenue,
      recentOrders
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 20, 1);
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      Order.find()
        .select('_id userId totalPrice date status paymentStatus invoiceNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email')
        .lean(),
      Order.countDocuments()
    ]);

    res.set('Cache-Control', 'public, max-age=60');
    res.json({
      orders,
      total,
      page,
      limit,
      hasMore: skip + orders.length < total
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 50, 1);
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments()
    ]);
    
    res.set('Cache-Control', 'public, max-age=300');
    res.json({
      users,
      total,
      page,
      limit,
      hasMore: skip + users.length < total
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 50, 1);
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      Product.find()
        .select('id title price category stock')
        .skip(skip)
        .limit(limit)
        .sort({ id: 1 })
        .lean(),
      Product.countDocuments()
    ]);
    
    res.set('Cache-Control', 'public, max-age=300');
    res.json({
      products,
      total,
      page,
      limit,
      hasMore: skip + products.length < total
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLowStockProducts = async (req, res) => {
  try {
    const threshold = Number(req.query.threshold) || 10;
    const products = await Product.find({ stock: { $lt: threshold } })
      .select('id title category stock price')
      .sort({ stock: 1 })
      .limit(100)
      .lean();

    res.set('Cache-Control', 'public, max-age=300');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const previousStatus = order.status;
    if (previousStatus !== status) {
      order.status = status;
      await order.save();

      await AdminActivity.create({
        action: 'order.status.update',
        actor: req.user,
        targetType: 'order',
        targetId: order._id.toString(),
        meta: { from: previousStatus, to: status }
      });
    }

    await order.populate('userId', 'name email');

    if (previousStatus !== status) {
      try {
        const recipient = order.userId?.email;
        if (recipient && isValidEmail(recipient)) {
          await sendEmail({
            to: recipient,
            subject: 'Order Status Updated - KrishCart',
            text: `Hello ${order.userId?.name || 'Customer'},\n\nYour order status has been updated.\nOrder ID: ${order._id}\nStatus: ${status}\n\nThank you for shopping with us.`,
            html: `<p>Hello ${order.userId?.name || 'Customer'},</p><p>Your order status has been updated.</p><p><strong>Order ID:</strong> ${order._id}</p><p><strong>Status:</strong> ${status}</p><p>Thank you for shopping with us.</p>`,
            type: 'order.status.update',
            relatedId: order._id.toString(),
            meta: { status }
          });
        }
      } catch (emailError) {
        console.error('Order status email failed:', emailError.message);
      }
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const allowedStatuses = ['pending', 'paid', 'failed'];

    if (!allowedStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const previousStatus = order.paymentStatus || 'pending';
    if (previousStatus !== paymentStatus) {
      order.paymentStatus = paymentStatus;
      if (paymentStatus === 'paid') {
        order.paymentVerifiedAt = new Date();
        if (order.status === 'pending') {
          order.status = 'paid';
        }
      }
      await order.save();

      await AdminActivity.create({
        action: 'order.payment.update',
        actor: req.user,
        targetType: 'order',
        targetId: order._id.toString(),
        meta: { from: previousStatus, to: paymentStatus }
      });
    }

    await order.populate('userId', 'name email');

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['user', 'admin'];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (req.user?.toString() === req.params.userId && role !== 'admin') {
      return res.status(400).json({ message: 'Cannot remove your own admin role' });
    }

    const user = await User.findById(req.params.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const previousRole = user.role;
    if (previousRole !== role) {
      user.role = role;
      await user.save();

      await AdminActivity.create({
        action: 'user.role.update',
        actor: req.user,
        targetType: 'user',
        targetId: user._id.toString(),
        meta: { from: previousRole, to: role }
      });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 50, 1);
    const skip = (page - 1) * limit;
    
    const [logs, total] = await Promise.all([
      AdminActivity.find()
        .select('action actor targetType targetId meta createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('actor', 'name email')
        .lean(),
      AdminActivity.countDocuments()
    ]);

    res.set('Cache-Control', 'private, max-age=60');
    res.json({
      logs,
      total,
      page,
      limit,
      hasMore: skip + logs.length < total
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEmailLogs = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 50, 1);
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const type = req.query.type;
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;

    const [logs, total] = await Promise.all([
      EmailLog.find(query)
        .select('to subject status error type messageId createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      EmailLog.countDocuments(query)
    ]);

    res.set('Cache-Control', 'private, max-age=60');
    res.json({
      logs,
      total,
      page,
      limit,
      hasMore: skip + logs.length < total
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.retryEmail = async (req, res) => {
  try {
    const log = await EmailLog.findById(req.params.logId);

    if (!log) {
      return res.status(404).json({ message: 'Email log not found' });
    }

    const result = await sendEmail({
      to: log.to,
      subject: log.subject,
      text: log.text,
      html: log.html,
      type: log.type,
      relatedId: log.relatedId,
      meta: { ...(log.meta || {}), retry: true },
      retryOf: log._id.toString()
    });

    res.json({ message: 'Retry triggered', result });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { id, title, price, category, image, stock, description } = req.body;

    if (!id || !title || !price || !category || !image) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingProduct = await Product.findOne({ $or: [{ id }, { title }] });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product with this ID or Title already exists' });
    }

    const product = new Product({
      id,
      title,
      price,
      category,
      image,
      stock: stock || 0,
      description: description || ''
    });

    await product.save();

    await AdminActivity.create({
      action: 'product.create',
      actor: req.user,
      targetType: 'product',
      targetId: product._id.toString(),
      meta: { title, price, category }
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { title, price, category, image, stock, description } = req.body;
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const changes = {};
    if (title && title !== product.title) changes.title = title;
    if (price && price !== product.price) changes.price = price;
    if (category && category !== product.category) changes.category = category;
    if (image && image !== product.image) changes.image = image;
    if (stock !== undefined && stock !== product.stock) changes.stock = stock;
    if (description !== undefined && description !== product.description) changes.description = description;

    Object.assign(product, changes);
    await product.save();

    if (Object.keys(changes).length > 0) {
      await AdminActivity.create({
        action: 'product.update',
        actor: req.user,
        targetType: 'product',
        targetId: product._id.toString(),
        meta: changes
      });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await AdminActivity.create({
      action: 'product.delete',
      actor: req.user,
      targetType: 'product',
      targetId: product._id.toString(),
      meta: { title: product.title, id: product.id }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getRevenueTrend = async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.set('Cache-Control', 'public, max-age=3600');
    res.json(trend);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;

    const topProducts = await Order.aggregate([
      {
        $unwind: '$products'
      },
      {
        $group: {
          _id: '$products.id',
          title: { $first: '$products.title' },
          totalSold: { $sum: '$products.quantity' },
          totalRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
        }
      },
      {
        $sort: { totalSold: -1 }
      },
      {
        $limit: limit
      }
    ]);

    res.set('Cache-Control', 'public, max-age=3600');
    res.json(topProducts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCategoryBreakdown = async (req, res) => {
  try {
    const breakdown = await Order.aggregate([
      {
        $unwind: '$products'
      },
      {
        $group: {
          _id: '$products.category',
          totalSold: { $sum: '$products.quantity' },
          totalRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      }
    ]);

    res.set('Cache-Control', 'public, max-age=3600');
    res.json(breakdown);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAnalyticsSummary = async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    // Use MongoDB aggregation for better performance
    const [currentData] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalPrice' },
            totalOrders: { $sum: 1 },
            totalProductsSold: { $sum: '$totalProducts' }
          }
        }
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: previousStartDate, $lt: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalPrice' }
          }
        }
      ])
    ]);

    const current = currentData[0] || { totalRevenue: 0, totalOrders: 0, totalProductsSold: 0 };
    const previousResult = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousStartDate, $lt: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    const previousRevenue = previousResult[0]?.totalRevenue || 0;
    const revenueGrowth = previousRevenue > 0 
      ? ((current.totalRevenue - previousRevenue) / previousRevenue * 100).toFixed(2)
      : '0.00';

    res.set('Cache-Control', 'public, max-age=3600');
    res.json({
      period: `Last ${days} days`,
      totalRevenue: Math.round(current.totalRevenue),
      totalOrders: current.totalOrders,
      averageOrderValue: current.totalOrders > 0 ? Math.round(current.totalRevenue / current.totalOrders) : 0,
      totalProductsSold: current.totalProductsSold,
      revenueGrowth: parseFloat(revenueGrowth)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

