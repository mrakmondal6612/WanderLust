if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listings.js"); 
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLAS_DB_CONNECTION_URL;

async function main() {
  await mongoose.connect(dbUrl);
}
wrapAsync(
  main().then((result) => {
    console.log("Database is Connected ");
  })
);

app.use(express.static(path.join(__dirname, "public")));
app.engine("ejs", engine);
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.secret,
  },
  touchAfter: 24 * 3600,
});

store.on("err", () => {
  console.log("Error in Mongo Session Store ", err);
});

const sessionOptions = {
  store,
  secret: process.env.secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.use("/", userRouter);
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "PAGE NOT FOUND "));
});

app.use((err, req, res, next) => {
  let { status = 500, message = "SOMETHING WENT WRONG " } = err;
  console.log(message);
  res.status(status).render("error.ejs", { err });
});

app.listen("8080", () => {
  console.log("Server is runing on port 8080");
});
