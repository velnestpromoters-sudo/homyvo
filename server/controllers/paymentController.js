const Property = require("../models/Property");
const Access = require("../models/Access");
const { createPaymentLink } = require("../services/instamojo");

// OWNER PAYMENT: Create listing order
exports.createListingOrder = async (req, res) => {
  try {
    const { email, propertyId } = req.body;
    const redirect_url = `${process.env.CLIENT_URL}/payment-success?type=listing&propertyId=${propertyId}`;

    const link = await createPaymentLink({
      amount: 500,
      purpose: "Property Listing Fee",
      email,
      redirect_url
    });

    res.json({ url: link });
  } catch (error) {
    console.error("Listing Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// TENANT PAYMENT: Create access order
exports.createAccessOrder = async (req, res) => {
  try {
    const { email, propertyId } = req.body;
    const redirect_url = `${process.env.CLIENT_URL}/payment-success?type=unlock&propertyId=${propertyId}`;

    const link = await createPaymentLink({
      amount: 49,
      purpose: "Unlock Property Contact",
      email,
      redirect_url
    });

    res.json({ url: link });
  } catch (error) {
    console.error("Access Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// VERIFY PAYMENT
exports.verifyPayment = async (req, res) => {
  try {
    const { type, propertyId, userId } = req.body;

    if (type === "listing") {
      await Property.findByIdAndUpdate(propertyId, { isActive: true, listingPaymentStatus: "paid" });
    }

    if (type === "unlock") {
      await Access.create({
        property: propertyId,
        user: userId || req.user?._id, // Handle if auth middleware is not applied to this particular request yet
        paymentStatus: "paid",
        interactionStage: "contact_unlocked"
      });
      // Burn a slot
      await Property.findByIdAndUpdate(propertyId, {
        $inc: { availableContactSlots: -1 }
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
