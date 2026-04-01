const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

(async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI missing');

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    const Product = require('./models/productModel');

    const totalDocs = await Product.countDocuments();
    if (!totalDocs) throw new Error('No products found');

    const sample = await Product.findOne().lean();
    const category = sample?.category || 'electronics';

    const escaped = String(category).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const filter = {
      category: { $regex: `^${escaped}$`, $options: 'i' },
      price: { $gte: 100, $lte: 10000 }
    };

    const runExplain = async (useIndex) => {
      let q = Product.find(filter).sort({ id: 1 }).limit(24).lean();
      q = useIndex ? q.hint({ category: 1, price: 1, id: 1 }) : q.hint({ $natural: 1 });
      return q.explain('executionStats');
    };

    const runs = 30;
    const indexed = [];
    const unindexed = [];

    for (let i = 0; i < 5; i++) {
      await runExplain(true);
      await runExplain(false);
    }

    for (let i = 0; i < runs; i++) {
      const e1 = await runExplain(true);
      const e2 = await runExplain(false);
      indexed.push(e1.executionStats.executionTimeMillis);
      unindexed.push(e2.executionStats.executionTimeMillis);
    }

    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const median = (arr) => {
      const s = [...arr].sort((a, b) => a - b);
      const m = Math.floor(s.length / 2);
      return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
    };

    const idxAvg = avg(indexed);
    const unAvg = avg(unindexed);
    const idxMed = median(indexed);
    const unMed = median(unindexed);

    const improvementAvg = ((unAvg - idxAvg) / unAvg) * 100;
    const improvementMedian = ((unMed - idxMed) / unMed) * 100;

    const idxEx = await runExplain(true);
    const unEx = await runExplain(false);

    const result = {
      totalProducts: totalDocs,
      sampleCategory: category,
      iterations: runs,
      indexed: {
        avgMs: Number(idxAvg.toFixed(2)),
        medianMs: Number(idxMed.toFixed(2)),
        docsExamined: idxEx.executionStats.totalDocsExamined,
        keysExamined: idxEx.executionStats.totalKeysExamined,
      },
      nonIndexedNaturalScan: {
        avgMs: Number(unAvg.toFixed(2)),
        medianMs: Number(unMed.toFixed(2)),
        docsExamined: unEx.executionStats.totalDocsExamined,
        keysExamined: unEx.executionStats.totalKeysExamined,
      },
      improvementPercent: {
        average: Number(improvementAvg.toFixed(2)),
        median: Number(improvementMedian.toFixed(2)),
      },
    };

    console.log(JSON.stringify(result, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error('BENCHMARK_ERROR:', err.message);
    process.exitCode = 1;
  }
})();
