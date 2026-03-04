const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/products - fetch products with pagination and filters
router.get('/', async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 24, 1);
    const search = String(req.query.search || '').trim();
    const category = String(req.query.category || '').trim();
    const minPrice = req.query.minPrice !== undefined ? Number(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : null;

    const filter = {};
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    if (category) {
      filter.category = { $regex: `^${escapeRegex(category)}$`, $options: 'i' };
    }
    if (minPrice !== null || maxPrice !== null) {
      filter.price = {};
      if (minPrice !== null && !Number.isNaN(minPrice)) {
        filter.price.$gte = minPrice;
      }
      if (maxPrice !== null && !Number.isNaN(maxPrice)) {
        filter.price.$lte = maxPrice;
      }
      if (Object.keys(filter.price).length === 0) {
        delete filter.price;
      }
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Product.find(filter)
        .select('id title price category image stock')
        .hint({ id: 1 }) // Use id index for sorting
        .sort({ id: 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Product.countDocuments(filter)
    ]);

    // Add caching headers for static product lists
    if (!search && page <= 2) {
      res.set('Cache-Control', 'public, max-age=600'); // 10 minutes cache for first pages
    } else if (!search) {
      res.set('Cache-Control', 'public, max-age=300'); // 5 minutes for other pages
    } else {
      res.set('Cache-Control', 'private, max-age=120'); // 2 minutes cache for filtered results
    }

    res.json({
      items,
      total,
      page,
      limit,
      hasMore: skip + items.length < total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
