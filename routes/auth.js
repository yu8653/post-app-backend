const router = require("express").Router();
const { registerValidation, loginValidation } = require("../validation");
const User = require("../models").userModel;
const jwt = require("jsonwebtoken");

router.use((req, res, next) => {
  next();
});

router.get("/testAPI", (req, res) => {
  const msgObj = {
    message: "Test API is Working.",
  };

  return res.json(msgObj);
});

router.post("/register", async (req, res) => {
  //check the validation of data
  //console.log("Register");
  //console.log(registerValidation(req.body));

  const { error } = registerValidation(req.body);
  if (error) {
    console.log(error);
    return res.status(400).send(error.details[0].message);
  }

  //check if the user exists
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) {
    return res.status(400).send("Email has already been registered.");
  }
  //register the user
  const newUser = new User({
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    role: req.body.role,
  });

  try {
    const savedUser = await newUser.save();
    res.status(200).send({
      msg: "success",
      savedObject: savedUser,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

router.post("/login", (req, res) => {
  //check the validation of data
  const { error } = loginValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      res.status(400), send(err);
    }

    if (!user) {
      res.status(401).send("Wrong email or password.");
    } else {
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (err) {
          return res.status(400).send(err);
        }

        if (isMatch) {
          const tokenObject = { _id: user._id, email: user.email };
          const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
          res.send({ success: true, token: `JWT ${token}`, user });
        } else {
          res.status(401).send("Wrong email or password.");
        }
      });
    }
  });
});

module.exports = router;
