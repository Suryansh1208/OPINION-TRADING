const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  user_id: { type: Number, unique: true },
  name: { type: String },
  mobile: { type: Number, required: true, trim: true, unique: true},
  password: { type: String },
  revenue: { type: Number },
  wallet: { type: Number },
  portfolio: { type: Number },
  status: { type: String },
  kyc: { type: String },
  community: { type: String },
  otp: {type: Number, trim: true},
  referral: {
    referralCode: {
      type: String
    },
    referredBy: {
      type: Number
    },
    referralCount: {
      type: Number,
      default: 0
    },
    referralChain: [
      {
        level: Number,
        user_id: Number
      }
    ],
    rewardsEarned: {
      type: Number,
      default: 0
    },
  }
});


// Pre-save hook to generate referralCode
UserSchema.pre('save', function(next) {
  if (this.isNew && !this.referral.referralCode) {
    const alphanumeric = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let referralCode = '';
    for (let i = 0; i < 6; i++) {
      referralCode += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
    }
    this.referral.referralCode = referralCode;
  }
  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
