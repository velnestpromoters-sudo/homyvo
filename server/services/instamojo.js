const axios = require('axios');

exports.createPaymentLink = async ({ amount, purpose, email, redirect_url }) => {
  const response = await axios.post(
    process.env.INSTAMOJO_BASE_URL + "payment-requests/",
    new URLSearchParams({
      purpose,
      amount,
      buyer_name: "Homyvo User",
      email: email || "user@homyvo.com",
      redirect_url,
      allow_repeated_payments: "false"
    }),
    {
      headers: {
        "X-Api-Key": process.env.INSTAMOJO_API_KEY,
        "X-Auth-Token": process.env.INSTAMOJO_AUTH_TOKEN,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );

  return response.data.payment_request.longurl;
};
