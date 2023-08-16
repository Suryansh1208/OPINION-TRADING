const express = require("express");
const dotenv = require("dotenv");
const mongoose = require('mongoose');
const app = express();
const cors = require("cors");
dotenv.config();
const uri = process.env.DB_CONNECT;
const PORT = process.env.PORT || 3030;

async function run() {
  try {
    const conn = await mongoose.connect(uri,{
      useNewUrlParser :true,
      useUnifiedTopology :true
    });
    console.log("DB is connected");

  } catch (error) {
    console.log(error.msg);
  }
}
run().catch(console.dir);

//Import Routes
const adminRoutes = require("./routes/admin");
const opinionRoutes = require("./routes/opinion")
const userRoutes = require("./routes/user");
const userbidRoutes = require("./routes/userbid");


// Middlewares
app.use(express.json());
app.use(cors());

//Route Middleware
app.use("/api/admins", adminRoutes);
app.use("/api/opinions", opinionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/userbid",userbidRoutes);

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});

