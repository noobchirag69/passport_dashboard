// Libraries
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");

// Initiating Express
const app = express();

// Connecting to Database
const dbURL =
  "mongodb+srv://chiragchakraborty48:NDRa7ZVbEJntNkTn@cluster0.jdtucsp.mongodb.net/?retryWrites=true&w=majority";
mongoose
  .connect(dbURL, {
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
    secret: "2973e5bd77059ecec05db58b61f83e313fb14fd0",
    resave: true,
    saveUninitialized: true,
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
const routes = require("./routes/routes");
app.use(routes);

// Default Error
app.use((req, res) => {
  res.status(404).render("error", { title: "Error" });
});
