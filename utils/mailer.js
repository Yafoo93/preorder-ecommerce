const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOrderConfirmation = async (to, orderId) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Your Order Has Been Confirmed!',
    html: `<p>Your order <strong>#${orderId}</strong> has been confirmed and is being processed.</p><p>Delivery is expected within 90 days.</p>`,
  });
};

const sendWelcomeEmail = async (to, fullName) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Welcome to My King Preorder Store!',
    html: `<p>Hi ${fullName},</p><p>Thank you for creating an account with us. You can now browse and preorder items easily.</p>`,
  });
};

const sendPaymentReceivedEmail = async (to, orderId) => {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: 'Payment Received – Awaiting Confirmation',
      html: `<p>We’ve received your payment for order <strong>#${orderId}</strong>.</p><p>Your payment is currently pending confirmation from our admin team.</p>`,
    });
  };
  
  module.exports = {
    sendOrderConfirmation,
    sendWelcomeEmail,
    sendPaymentReceivedEmail,
  };
  
