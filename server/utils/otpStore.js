const otpStore = new Map();

exports.saveOTP = (email, otp) => {
  otpStore.set(email, {
    otp: otp.toString(),
    expires: Date.now() + 5 * 60 * 1000,
  });
};

exports.verifyOTP = (email, otp) => {
  const record = otpStore.get(email);

  if (!record) return false;
  if (Date.now() > record.expires) {
    otpStore.delete(email);
    return false;
  }

  // Delete after successful single-use verification
  if (record.otp === otp.toString()) {
     otpStore.delete(email);
     return true;
  }

  return false;
};
