const nodemailer = require('nodemailer');

// Initialize email transporter
let transporter;

const initializeEmailService = () => {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send booking notification to turf owner
const sendBookingNotification = async (turf, user, booking) => {
  try {
    if (!transporter) {
      initializeEmailService();
    }

    const bookingDate = new Date(booking.date);
    const formattedDate = bookingDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: turf.email,
      subject: `New Booking Confirmed - ${turf.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #fff; padding: 30px; border-radius: 8px;">
            <h1 style="color: #22c55e; margin-bottom: 20px;">New Booking Confirmed!</h1>

            <div style="background-color: #f0fdf4; padding: 15px; border-left: 4px solid #22c55e; margin-bottom: 20px;">
              <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #065f46;">Booking Details</h2>
              <p style="margin: 5px 0;"><strong>Turf:</strong> ${turf.name}</p>
              <p style="margin: 5px 0;"><strong>Location:</strong> ${turf.location}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${formattedDate}</p>
              <p style="margin: 5px 0;"><strong>Time Slot:</strong> ${booking.timeSlot}</p>
              <p style="margin: 5px 0;"><strong>Price:</strong> ₹${booking.price}</p>
            </div>

            <div style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
              <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #92400e;">Customer Information</h2>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${user.name}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${user.phoneNumber || 'Not provided'}</p>
              <p style="margin: 5px 0;"><strong>Number of Players:</strong> ${booking.totalPlayers || 1}</p>
            </div>

            <div style="background-color: #dbeafe; padding: 15px; border-left: 4px solid #3b82f6;">
              <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #0c2d6b;">Price Breakdown</h2>
              <p style="margin: 5px 0;"><strong>Base Price:</strong> ₹${booking.priceBreakdown?.basePrice || booking.price}</p>
              <p style="margin: 5px 0; border-top: 2px solid #3b82f6; padding-top: 10px;"><strong>Total Amount:</strong> ₹${booking.price}</p>
            </div>
          </div>
        </div>
      `,
    };

    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      await transporter.sendMail(mailOptions);
      console.log(`✓ Booking notification sent to ${turf.email}`);
      return true;
    } else {
      console.warn('Email credentials not configured. Skipping email notification.');
      return false;
    }
  } catch (error) {
    console.error('Error sending booking email:', error.message);
    return false;
  }
};

// Send booking confirmation to user
const sendUserBookingConfirmation = async (user, turf, booking) => {
  try {
    if (!transporter) {
      initializeEmailService();
    }

    const bookingDate = new Date(booking.date);
    const formattedDate = bookingDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Booking Confirmation - ${turf.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #fff; padding: 30px; border-radius: 8px;">
            <h1 style="color: #22c55e; margin-bottom: 20px;">Your Booking is Confirmed!</h1>

            <p style="margin-bottom: 20px; font-size: 16px; color: #333;">Hi ${user.name},</p>

            <div style="background-color: #f0fdf4; padding: 15px; border-left: 4px solid #22c55e; margin-bottom: 20px;">
              <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #065f46;">Your Booking Summary</h2>
              <p style="margin: 5px 0;"><strong>Turf:</strong> ${turf.name}</p>
              <p style="margin: 5px 0;"><strong>Location:</strong> ${turf.location}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${formattedDate}</p>
              <p style="margin: 5px 0;"><strong>Time Slot:</strong> ${booking.timeSlot}</p>
              <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${booking.price}</p>
            </div>

            <div style="background-color: #e0e7ff; padding: 15px; border-left: 4px solid #4f46e5; margin-bottom: 20px;">
              <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #312e81;">Turf Contact</h2>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${turf.phoneNumber}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${turf.email}</p>
            </div>

            <div style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b;">
              <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #92400e;">Next Steps</h2>
              <ol style="margin: 0; padding-left: 20px; color: #333;">
                <li>The turf owner will review your booking</li>
                <li>They will contact you to confirm</li>
                <li>Complete payment as per their instructions</li>
                <li>Arrive 15 minutes early</li>
              </ol>
            </div>
          </div>
        </div>
      `,
    };

    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      await transporter.sendMail(mailOptions);
      console.log(`✓ Booking confirmation sent to ${user.email}`);
      return true;
    } else {
      console.warn('Email credentials not configured. Skipping email confirmation.');
      return false;
    }
  } catch (error) {
    console.error('Error sending confirmation email:', error.message);
    return false;
  }
};

module.exports = {
  initializeEmailService,
  sendBookingNotification,
  sendUserBookingConfirmation,
};
