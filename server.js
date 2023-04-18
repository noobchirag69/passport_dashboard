// Libraries
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
require('dotenv').config(); // Environment Variables

// Initiating Express
const app = express();

// Connecting to Database
mongoose
  .connect(process.env.dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) =>
    app.listen(process.env.PORT || 3000, () => {
      console.log("Server running on port 3000");
    })
  )
  .catch((err) => console.log(err));

// Middlewares
app.use(express.urlencoded({ extended: true })); // Express Body Parser
app.use(express.json()); // JSON Response
app.use(express.static("public")); // Static Folder

// View Engine
app.set("view engine", "ejs");

// Passport Configuration
require("./config/passport")(passport);

// Express session
app.use(
  session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    // cookie: {
    //   secure: true,
    //   httpOnly: true,
    //   maxAge: 2147483647, // Session won't expire
    // },
  })
);

// Passport Middlewares
app.use(passport.initialize());
app.use(passport.session());

// Connect Flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Routes
const routes = require("./routes/routes")
app.use(routes);

// Default Error
app.use((req, res) => {
  res.status(404).render("error", { title: "Error" });
});
