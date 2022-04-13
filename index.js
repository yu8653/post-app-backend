const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const authRoute = require("./routes").auth;
const postRoute = require("./routes").post;
const passport = require("passport");
require("./config/passport")(passport);
const cors = require("cors");

//connect to DB
mongoose
  .connect(process.env.DB_CONNECT, {
    useNewurlparser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connect to Mongo Altas");
  })
  .catch((e) => {
    console.log(e);
  });

//middlware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/api/user", authRoute);
app.use(
  "/api/post",
  passport.authenticate("jwt", { session: false }),
  postRoute
);

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port 5000.");
});
