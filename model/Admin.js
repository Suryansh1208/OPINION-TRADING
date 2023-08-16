const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const CounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    sequence_value: { type: Number, default: 1 }
  });
  
const Counter = mongoose.model('adminCounter', CounterSchema);

const adminSchema = new mongoose.Schema({
    status : {
        type: String
    },
    name : {
        type: String
    },
    email : {
        type : String,
        unique: true
    },
    password : {
        type : String
    },
    company : {
        type : String
    },
    mobile:{
        type : Number,
        required: true,
        trim: true,
        unique: true
    },
    access:{
        type: String
    },
    kyc : {
        type : String
    },
    money : {
        winning_commission: { type : Number},
        trading_fee: { type : Number}
    },
    role : {
        type : String
    },
    u_id :{
        type: Number, 
        unique: true
    }
});

adminSchema.pre('save', function (next) {
    const doc = this;
    Counter.findByIdAndUpdate(
      { _id: 'adminId' },
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    )
      .then((counter) => {
        doc.u_id = counter.sequence_value;
        next();
      })
      .catch((error) => {
        next(error);
      });
  });

adminSchema.pre('save', async function(){
    let salt = await bcrypt.genSalt();
    let hashedString = await bcrypt.hash(this.password, salt);
    this.password=hashedString;
    console.log(this.password);
});
const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;