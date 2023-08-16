const Admin = require("../model/Admin");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
dotenv.config();

//Get All Admins
const all_admins = async (req, res) => {
    try {
        const admins = await Admin.find({role:req.params.role});
        console.log(admins);
        res.json(admins);
      } catch (error) {
        res.json({ message: error });
      }
};

//Get Single Admin
const get_admin = async (req, res) => {
  try {
    const { status, role, mobile, company, access, kyc} = req.query;

    // Build the filter object based on query parameters
    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (role) {
      filter.role = role;
    }
    if (mobile) {
      filter.mobile = mobile;
    }
    if (company) {
      filter.company = company;
    }
    if (access) {
      filter.access = access;
    }
    if (kyc) {
      filter.kyc = kyc;
    }

    const admins = await Admin.find(filter);
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching admins' });
  }
};

const sign_up = async (req, res) => {
  try {
    // Get user input
    
    const { name,  password, mobile, email, role, company, status} = req.body;

    // Validate user input
    if (!(name && password && mobile&& email)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const existingUser = await Admin.findOne({ mobile: mobile });

    if (existingUser) {
      return res.status(409).json({message: "Admin Already Exist. Please Login"});
    }
    
    //Encrypt user password
    let salt = await bcrypt.genSalt();
    const hashedString = await bcrypt.hash(password, salt);
    // Create user in our database
    const user = await Admin.create({
      name : name,
      mobile: mobile,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: hashedString,
      role: role,
      company: company,
      status: status
    });

    // Create token
    const token = jwt.sign(
      { mobile : user.mobile, id : user._id },
      process.env.TOKEN_KEY,
    );
    // save user token
    res.cookie('jwtToken', token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true }); // maxAge: 2 hours
    // return new user
    return res.status(201).json({ user : user, token: token});
  } catch (err) {
    console.log(err);
    return res.status(500).json({message: "Something went wrong"});
  }
  // Our register logic ends here
};

const login = async (req, res) => {

  // Our login logic starts here
  try {
    // Get user input
    const { mobile, password } = req.body;

    // Validate user input
    if (!(mobile && password)) {
      res.status(400).send("All input is required");
    }

    // Validate if user exist in our database
    const existingUser = await Admin.findOne({ mobile: mobile });

    if (!existingUser) {
      return res.status(409).json({message: "User not found. Please Sign up"});
    }

    const matchPassword = await bcrypt.compare(password, existingUser.password);
      // Create token
    if(matchPassword){
      const token = jwt.sign(
        { mobile: existingUser.mobile, id : existingUser._id },
        process.env.TOKEN_KEY,
      );

      res.cookie('jwtToken', token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true }); // maxAge: 2 hours

      // save user token
      return res.status(201).json({ user : existingUser, token: token});


      // user
      // res.status(200).json(user);
    }
    return res.status(400).json({message: "Invalid Credentials"});
  } catch (err) {
    console.log(err);
    return res.status(500).json({message: "Something went wrong"});
  }
  // Our register logic ends here
};

//Add New Admin
const add_admin = async (req, res) => {
  const {email, password} = req.body;
  console.log(email);
  console.log(password);
  console.log("inside post")
    const admin = new Admin({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        mobile: req.body.mobile,
        status: req.body.status,
        company: req.body.company,
        access: req.body.access,
        money: req.body.money,
        role: req.body.role,
        kyc: req.body.kyc,
      });
    
      try {
        const savedadmin = await admin.save();
        res.send(savedadmin);

        var transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "suhailansari@birthvenue.co",
            pass: "lnjqfvflvmwhxqky",
          },
        });
    
        var mailOptions = {
          from: "suhailansari@birthvenue.co",
          to: email,
          subject: `Earn-X Profile Created`,
          text: `Congrats, your profile has been created. \nYour email id is ${email} and password is ${password}. \nYou can now use these credentials to sign in at Earn-X`
        };
    
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
            res.send(info.response);
          }
        });
      } catch (error) {
        res.status(400).send(error);
      }
};

//Delete Admin
const delete_admin = async (req, res) => {
    try {
        console.log(req.params.mobile);
        const removeAdmin = await Admin.deleteOne({mobile: req.params.mobile});
        res.json(removeAdmin);
      } catch (error) {
        res.json({ message: error });
      }
};

//Update Admin
const update_admin = async (req, res) => {
    try {
        const admin = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            mobile: req.body.mobile,
            status: req.body.status,
            company: req.body.company,
            access: req.body.access,
            money: req.body.money,
            role: req.body.role,
            kyc: req.body.kyc,
        };

        console.log(admin);
    
        const updatedAdmin = await Admin.findOneAndUpdate(
          { mobile: req.params.mobile },
          admin
        );
        res.json(admin);
      } catch (error) {
        res.json({ message: error });
      }
};

const forget = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  try {
    const oldUser = await Admin.findOne({ email: email });
    if (!oldUser) {
      return res.json({ status: "User Not Exists!!" });
    }
    const secret = process.env.TOKEN_KEY + oldUser.password;
    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, {
      expiresIn: "15m",
    });
    const link = `http://localhost:3030/api/admins/reset-password/${oldUser._id}/${token}`;

    console.log("Suhail")
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "suhailansari@birthvenue.co",
        pass: "lnjqfvflvmwhxqky",
      },
    });

    var mailOptions = {
      from: "suhailansari@birthvenue.co",
      to: email,
      subject: "Password Reset",
      text: `You can reset your password by clicking the link down below. It'll expire automatically in 15 minutes\n\n` +link,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
        res.send(info.response);
      }
    });
    console.log(link);
  } catch (error) { 
    console.log(error);
  }
};

const getToken = async  (req, res) => {
  const { id, token } = req.params;
  console.log(req.params);
  const oldUser = await Admin.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }
  const secret = process.env.TOKEN_KEY + oldUser.password;
  try {
    const verify = jwt.verify(token, secret);
    res.send("Verified")
    // res.render("index", { email: verify.email, status: "Not Verified" });
  } catch (error) {
    console.log(error);
    res.send("Not Verified");
  }
};

const postToken =  async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  const oldUser = await Admin.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }
  const secret = process.env.TOKEN_KEY + oldUser.password;
  try {
    const verify = jwt.verify(token, secret);
    let salt = await bcrypt.genSalt();
    const encryptedPassword = await bcrypt.hash(password, salt);
    await Admin.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          password: encryptedPassword,
        },
      }
    );

    res.send("Password is changed")

    // res.render("index", { email: verify.email, status: "verified" });
  } catch (error) {
    console.log(error);
    res.json({ status: "Something Went Wrong" });
  }
};

module.exports = {
    all_admins,
    get_admin,
    add_admin,
    delete_admin,
    update_admin,
    login,
    sign_up,
    forget,
    getToken,
    postToken
}