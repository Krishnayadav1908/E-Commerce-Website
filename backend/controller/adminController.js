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
      .sort({ _id: -1 })
      .limit(5)
      .populate('userId', 'name email');

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
    const limit = Number(req.query.limit) || 0;
    const orders = await Order.find()
      .sort({ _id: -1 })
      .limit(limit)
      .populate('userId', 'name email');

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLowStockProducts = async (req, res) => {
  try {
    const threshold = Number(req.query.threshold) || 10;
    const products = await Product.find({ stock: { $lt: threshold } })
      .sort({ stock: 1 });

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
    const limit = Number(req.query.limit) || 50;
    const logs = await AdminActivity.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('actor', 'name email');

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEmailLogs = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const status = req.query.status;
    const type = req.query.type;
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;

    const logs = await EmailLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(logs);
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

    const orders = await Order.find({ createdAt: { $gte: startDate } });
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalProducts = orders.reduce((sum, order) => sum + (order.totalProducts || 0), 0);

    // Calculate day-over-day growth (vs previous period)
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);
    const previousOrders = await Order.find({
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });
    const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const revenueGrowth = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue * 100).toFixed(2)
      : '0.00';

    res.json({
      period: `Last ${days} days`,
      totalRevenue: Math.round(totalRevenue),
      totalOrders,
      averageOrderValue: Math.round(averageOrderValue),
      totalProductsSold: totalProducts,
      revenueGrowth: parseFloat(revenueGrowth)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

