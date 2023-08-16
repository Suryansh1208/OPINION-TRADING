const User = require("../model/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();

//Get All Users
const all_users = async (req, res) => {
  try {
    const { name, mobile, status, community, kyc, referral } = req.query;

    // Build the filter object based on query parameters
    const filter = {};
    if (name) {
      filter.name = name;
    }
    if (mobile) {
      filter.mobile = mobile;
    }
    if (status) {
      filter.status = status;
    }
    if (community) {
      filter.community = community;
    }
    if (kyc) {
      filter.kyc = kyc;
    }
    if (referral) {
      filter['referral.referredBy'] = referredBy;
      filter['referral.referralCount'] = referralCount;
    }

    const users = await User.find(filter);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching users' });
  }
};

//Get Single User
const get_user = async (req, res) => {
  console.log("inside get user")
    try {
        console.log(req.params.mobile);
        const user = await User.find({mobile:req.params.mobile})
        // const admin = await Admin.findById(req.params.admin_id);
        console.log(user);
        res.json(user);
      } catch (error) {
        res.json({ message: error });
      }
};

//Add New User
const add_user = async (req, res) => {
  console.log("inside put")
    const user = new User({
        name: req.body.name,
        password: req.body.password,
        mobile: req.body.mobile,
        revenue: req.body.revenue,
        wallet: req.body.wallet,
        portfolio: req.body.portfolio,
        status: req.body.status,
        kyc: req.body.kyc,
        community: req.body.community
      });
    
      try {
        const saveduser = await user.save();
        res.send(saveduser);
      } catch (error) {
        res.status(400).send(error);
      }
};

//Delete User
const delete_user = async (req, res) => {
    try {
        const removeuser = await User.deleteOne({mobile:req.params.mobile});
        res.json(removeuser);
      } catch (error) {
        res.json({ message: error });
      }
};

//Update User
const update_user = async (req, res) => {
    try {
        const user = {
          name: req.body.name,
          password: req.body.password,
          mobile: req.body.mobile,
          revenue: req.body.revenue,
          wallet: req.body.wallet,
          portfolio: req.body.portfolio,
          status: req.body.status,
          kyc: req.body.kyc,
          community: req.body.community
        };

        console.log(user);
    
        const updateduser = await User.findOneAndUpdate(
          { mobile: req.params.mobile },
          user
        );
        res.json(user);
      } catch (error) {
        res.json({ message: error });
      }
};

const sign_up = async (req, res, next) => {
  try {
    // Get user input
    const { name, mobile, community, referralCode } = req.body;

    // Validate user input
    if (!(name && mobile)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const existingUser = await User.findOne({ mobile: mobile });

    if (existingUser) {
      return res.status(409).json({ message: "Admin Already Exist. Please Login" });
    }

    // Create user in our database
    const userData = { name, mobile, community };
    if (referralCode) {
      const referrer = await User.findOne({ 'referral.referralCode': referralCode });
      if (referrer) {
        userData.referral = { referredBy: referrer.user_id };
        const referralChain = [{ level: 1, user_id: referrer.user_id }];
        if (referrer.referral.referralChain) {
          for (const ref of referrer.referral.referralChain) {
            if (ref.level < 4) {
              referralChain.push({ level: ref.level + 1, user_id: ref.user_id });
            }
          }
        }
        userData.referral.referralChain = referralChain;
        await User.updateOne(
          { user_id: referrer.user_id },
          { $inc: { 'referral.referralCount': 1 } }
        );
        for (const ref of referralChain) {
          await User.updateOne(
            { user_id: ref.user_id },
            { $inc: { 'referral.rewardsEarned': getRewardForLevel(ref.level) } }
          );
        }
      }
    }
    const user = await User.create(userData);

    res.status(201).json({ user: user });

    function getRewardForLevel(level) {
      // Return the reward amount for the given level
      // You can customize this function according to your needs
      switch (level) {
        case 1:
          return 40;
        case 2:
          return 25;
        case 3:
          return 15;
        case 4:
          return 10;
        default:
          return 0;
      }
    }


    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
  // Our register logic ends here
};


const generateOTP = async (req, res, next) => {
  try {
    // Get user input
    const { mobile } = req.body;

    // Validate user input
    if (!mobile) {
      return res.status(400).send("Mobile Number is required");
    }

    // Validate if user exists in our database
    const existingUser = await User.findOne({ mobile: mobile });

    if (!existingUser) {
      return res.status(409).json({ message: "User not found. Please Sign up" });
    }

    let random = Math.floor(Math.random() * 900000) + 100000;
    existingUser.otp = random;
    await existingUser.save();


    // const fast2sms = require('fast-two-sms')

    // var options = {authorization : "lwbzF3rIk5WT0E8S2JZf6RmBDnvYxGuVhO4XA1KeNg7QLiMspUyM4R0EbV9jBteOlhC3i6IfHdgnJcYx" , message : 'Hey You there' ,  numbers : [mobile]} 
    // const res2 = await fast2sms.sendMessage(options) //Asynchronous Function.

    // console.log(res2);

    accountSid = 'ACc5358182ec884510e49dfac5daf8c6cb';
    authToken = '6f111c8270baef0b07541dd837b2e37c';

    const client = require('twilio')(accountSid, authToken);

    client.messages
      .create({
        body: `Your OTP for Earn-X is ${random}.`,
        from: '+15418738806',
        to: '+91' + mobile
      })
      .then(message => console.log(message.sid))
      .catch(error => console.error(error));

    res.status(200).json({ otp: random });
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ otp: "Something went wrong" });
  }
};

const verifyOTP = async (req, res, next) => {
  // Our login logic starts here
  try {
    // Get user input
    const { mobile, otp } = req.body;

    // Validate user input
    if (!(mobile)) {
      res.status(400).send("Mobile Number is required");
    }

    // Validate if user exist in our database
    const existingUser = await User.findOne({ mobile: mobile });

    if (!existingUser) {
      return res.status(409).json({message: "User not found. Please Sign up"});
    }

    if(otp === existingUser.otp){

          // Create token
    const token = jwt.sign(
      { mobile : existingUser.mobile, id : existingUser._id },
      process.env.TOKEN_KEY,
    );
    // return new user
    return res.status(201).json({ user : existingUser, token: token});
    }

    return res.status(400).json({message: "Invalid Credentials"});
  } catch (err) {
    console.log(err);
    return res.status(500).json({message: "Something went wrong"});
  }
  // Our register logic ends here
};

module.exports = {
    all_users,
    get_user,
    add_user,
    delete_user,
    update_user,
    sign_up,
    generateOTP,
    verifyOTP
}
