const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModels');
const { sendEmail } = require('../utils/email');
const { isValidEmail } = require('../utils/validation');
const { generateInvoicePDF, generateInvoiceNumber } = require('../utils/invoice');

// Create a new order (with stock deduction)
exports.createOrder = async (req, res) => {
  try {
    const {
      userId,
      products,
      totalPrice,
      totalProducts,
      date,
      address,
      paymentMethod,
      paymentStatus,
      paymentRef,
      paymentNotes
    } = req.body;

    // Validate products array
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Products array is required and cannot be empty' });
    }

    // Check and deduct stock for each product
    for (const item of products) {
      const productRef = item._id || item.id;
      const product = item._id
        ? await Product.findById(item._id)
        : await Product.findOne({ id: item.id });
      
      if (!product) {
        return res.status(404).json({ error: `Product ${productRef} not found` });
      }

      const quantity = item.quantity || 1;
      if (product.stock < quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.title}. Available: ${product.stock}, Required: ${quantity}`
        });
      }

      // Deduct stock
      product.stock -= quantity;
      await product.save();
    }

    const method = paymentMethod || 'upi';
    if (method === 'upi' && paymentRef && String(paymentRef).trim().length < 6) {
      return res.status(400).json({ error: 'UPI transaction ID looks invalid' });
    }

    const allowedPaymentStatuses = ['pending', 'paid', 'failed'];
    const effectivePaymentStatus = allowedPaymentStatuses.includes(paymentStatus)
      ? paymentStatus
      : 'pending';

    // Create order
    const order = new Order({
      userId,
      products,
      totalPrice,
      totalProducts,
      date,
      status: effectivePaymentStatus === 'paid' ? 'paid' : 'pending',
      paymentMethod: method,
      paymentStatus: effectivePaymentStatus,
      paymentRef: paymentRef || '',
      paymentNotes: paymentNotes || '',
      address
    });
    await order.save();

    // Send confirmation email without blocking order creation
    try {
      const user = await User.findById(userId).select('name email');
      if (user?.email && isValidEmail(user.email)) {
        const itemsList = products
          .map((item) => `${item.title} x${item.quantity}`)
          .join(', ');
        await sendEmail({
          to: user.email,
          subject: 'Order Confirmation - KrishCart',
          text: `Hello ${user.name || 'Customer'},\n\nYour order has been placed successfully.\nOrder ID: ${order._id}\nItems: ${itemsList}\nTotal: ${totalPrice}\nStatus: ${order.status}\n\nThank you for shopping with us.`,
          html: `<p>Hello ${user.name || 'Customer'},</p><p>Your order has been placed successfully.</p><p><strong>Order ID:</strong> ${order._id}</p><p><strong>Items:</strong> ${itemsList}</p><p><strong>Total:</strong> ${totalPrice}</p><p><strong>Status:</strong> ${order.status}</p><p>Thank you for shopping with us.</p>`,
          type: 'order.confirmation',
          relatedId: order._id.toString(),
          meta: { totalPrice, totalProducts }
        });
      }
    } catch (emailError) {
      console.error('Order confirmation email failed:', emailError.message);
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all orders for a user
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Download order invoice as PDF
exports.downloadInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.query;

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (userId && order.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized to access this order' });
    }

    // Generate invoice number if not already generated
    let invoiceNumber = order.invoiceNumber;
    if (!invoiceNumber) {
      invoiceNumber = generateInvoiceNumber();
      order.invoiceNumber = invoiceNumber;
      order.invoiceGeneratedAt = new Date();
      await order.save();
    }

    // Generate PDF
    const pdfStream = generateInvoicePDF(order, invoiceNumber);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice-${invoiceNumber}.pdf"`
    );

    // Stream PDF to response
    pdfStream.pipe(res);

    // Handle stream errors
    pdfStream.on('error', (err) => {
      console.error('PDF generation error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to generate PDF' });
      }
    });

  } catch (error) {
    console.error('Invoice download error:', error);
    res.status(500).json({ error: error.message });
  }
};
