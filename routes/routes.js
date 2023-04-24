const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const passport = require("passport");

// Load User Model
const User = require("../models/user");
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");

// Index Route
router.get("/", forwardAuthenticated, (req, res) =>
  res.render("index", { title: "Home" })
);

// Login Route
router.get("/login", forwardAuthenticated, (req, res) =>
  res.render("login", { title: "Login" })
);

// Register Route
router.get("/register", forwardAuthenticated, (req, res) =>
  res.render("register", { title: "Register" })
);

// Dashboard Route
router.get("/dashboard", ensureAuthenticated, (req, res) =>
  res.render("dashboard", {
    user: req.user,
    title: "Dashboard",
  })
);

// Update Profile Route
router.get("/edit", ensureAuthenticated, (req, res) =>
  res.render("edit", {
    user: req.user,
    title: "Update",
  })
);

// Create a New Account
router.post("/register", (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  const errors = [];

  if (!name || !email || !password || !confirmPassword) {
    errors.push({ msg: "All fields are mandatory!" });
  }

  if (password != confirmPassword) {
    errors.push({ msg: "Passwords do not match!" });
  }

  if (password.length < 8) {
    errors.push({ msg: "Password must be at least 8 characters long!" });
  }

  if (errors.length > 0) {
    res.render("register", {
      title: "Register",
      errors,
      name,
      email,
      password,
      confirmPassword,
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "This Email Address is already taken!" });
        res.render("register", {
          title: "Register",
          errors,
          name,
          email,
          password,
          confirmPassword,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });

        // Hashing the Password using Bcrypt
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "Registration successful! Please log in to access your dashboard."
                );
                res.redirect("/login");
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

// Login to Dashboard
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success_msg", "You have successfully logged in!");
    res.redirect("/dashboard");
  }
);

// Update Profile
router.post("/edit/:id", (req, res) => {
  const id = req.params.id;
  const updatedUser = req.body;
  User.findByIdAndUpdate(id, updatedUser)
    .then((result) => {
      req.flash(
        "success_msg",
        "You have successfully updated your User Profile!"
      );
      res.redirect("/dashboard");
    })
    .catch((err) => console.log(err));
});

// Logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
      return next(err);
    }
    req.flash("success_msg", "You have successfully logged out!");
    res.redirect("/login");
  });
});

module.exports = router;
