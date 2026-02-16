const PDFDocument = require("pdfkit");


// Generate invoice PDF
 
const generateInvoicePDF = (order, invoiceNumber) => {
  const doc = new PDFDocument({
    margin: 50,
  });

  const pageLeft = doc.page.margins.left;
  const pageRight = doc.page.width - doc.page.margins.right;
  const pageBottom = doc.page.height - doc.page.margins.bottom;

  const formatMoney = (value) => `₹${Number(value || 0).toFixed(2)}`;

  const drawDivider = () => {
    doc
      .moveTo(pageLeft, doc.y)
      .lineTo(pageRight, doc.y)
      .stroke();
  };

  const ensureSpace = (height) => {
    if (doc.y + height > pageBottom) {
      doc.addPage();
    }
  };


// HEADER

  doc.fontSize(22).font("Helvetica-Bold").text("INVOICE", {
    align: "center",
  });

  doc.moveDown(0.4);

  doc
    .fontSize(10)
    .font("Helvetica")
    .text("KrishCart E-Commerce", { align: "center" })
    .text("www.KrishCart.com | support@KrishCart.com", {
      align: "center",
    })
    .text("GST: 18AABCT1234H1Z5", { align: "center" });

  doc.moveDown(0.8);
  drawDivider();
  doc.moveDown(1);

 // INVOICE DETAILS

  doc.fontSize(10).font("Helvetica-Bold");

  doc.text(`Invoice #: ${invoiceNumber}`);
  doc.text(`Order ID: ${order._id}`);
  doc.text(
    `Date: ${new Date(order.createdAt).toLocaleDateString()}`,
    { align: "right" }
  );

  doc.moveDown(1);

// BILL TO

  doc.font("Helvetica-Bold").text("BILL TO:");
  doc.moveDown(0.3);

  doc.font("Helvetica").fontSize(9);

  const address = order.address || {};

  if (address.name) doc.text(address.name);
  if (address.email) doc.text(address.email);
  if (address.street) doc.text(address.street);

  const cityLine = `${address.city || ""}${
    address.city ? ", " : ""
  }${address.state || ""} ${address.zip || ""}`.trim();

  if (cityLine) doc.text(cityLine);
  if (address.phone) doc.text(`Phone: ${address.phone}`);

  doc.moveDown(1);
  drawDivider();
  doc.moveDown(1);


// TABLE HEADER


  const columnItem = pageLeft;
  const columnQty = pageLeft + 300;
  const columnPrice = pageLeft + 360;
  const columnAmount = pageLeft + 440;

  doc.fontSize(10).font("Helvetica-Bold");

  doc.text("Item", columnItem);
  doc.text("Qty", columnQty, doc.y - 12, { width: 40, align: "right" });
  doc.text("Price", columnPrice, doc.y - 12, { width: 60, align: "right" });
  doc.text("Amount", columnAmount, doc.y - 12, {
    width: 80,
    align: "right",
  });

  doc.moveDown(0.5);
  drawDivider();
  doc.moveDown(0.5);


// TABLE ROWS


  doc.font("Helvetica").fontSize(9);

  let subtotal = 0;

  const products = Array.isArray(order.products)
    ? order.products
    : [];

  products.forEach((product) => {
    const quantity = product.quantity || 1;
    const price = product.price || 0;
    const amount = quantity * price;

    subtotal += amount;

    ensureSpace(20);

    const rowY = doc.y;

    doc.text(product.name || "Product", columnItem, rowY, {
      width: 280,
    });

    doc.text(quantity.toString(), columnQty, rowY, {
      width: 40,
      align: "right",
    });

    doc.text(formatMoney(price), columnPrice, rowY, {
      width: 60,
      align: "right",
    });

    doc.text(formatMoney(amount), columnAmount, rowY, {
      width: 80,
      align: "right",
    });

    doc.moveDown();
  });

  doc.moveDown(0.5);
  drawDivider();
  doc.moveDown(1);

 //  TOTALS

  const gst = +(subtotal * 0.18).toFixed(2);
  const total = +(subtotal + gst).toFixed(2);

  const totalsLeft = columnAmount - 60;

  doc.fontSize(9).font("Helvetica");

  doc.text("Subtotal:", totalsLeft, doc.y);
  doc.text(formatMoney(subtotal), columnAmount, doc.y - 12, {
    width: 80,
    align: "right",
  });

  doc.moveDown(0.5);

  doc.text("GST (18%):", totalsLeft, doc.y);
  doc.text(formatMoney(gst), columnAmount, doc.y - 12, {
    width: 80,
    align: "right",
  });

  doc.moveDown(0.5);

  doc.font("Helvetica-Bold").fontSize(10);

  doc.text("TOTAL:", totalsLeft, doc.y);
  doc.text(formatMoney(total), columnAmount, doc.y - 12, {
    width: 80,
    align: "right",
  });

  doc.moveDown(1.5);


// PAYMENT INFO
 

  doc.font("Helvetica").fontSize(9);

  const paymentStatus =
    order.paymentStatus?.toUpperCase() === "SUCCESS"
      ? "PAID"
      : "PENDING";

  doc.text(`Payment Status: ${paymentStatus}`);
  doc.text(
    `Payment Method: ${(order.paymentMethod || "UPI").toUpperCase()}`
  );

  if (order.paymentRef) {
    doc.text(`Transaction ID: ${order.paymentRef}`);
  }

  doc.moveDown(1.5);

 
 // FOOTER
 

  drawDivider();
  doc.moveDown(0.5);

  doc
    .fontSize(8)
    .text(
      "Thank you for your purchase! For support, contact support@KrishCart.com",
      { align: "center" }
    );

  doc.end();
  return doc;
};

// Generate unique invoice number
 
const generateInvoiceNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `INV-${timestamp}-${random}`;
};

module.exports = {
  generateInvoicePDF,
  generateInvoiceNumber,
};