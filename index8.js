import express from "express";
import ejs from "ejs";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import "dotenv/config";
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
import moment from "moment";
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

const port = 3000;
mongoose
  .connect("mongodb://127.0.0.1:27017/tweetdb")
  .then(() => console.log("Connected to mongodb!"));
let now = moment();
// console.log(date);
const userschema = new mongoose.Schema({
  username: String,
  name: String,
  password: String,
  Tweets: [
    {
      content: String,
      timestamp: String,
    },
  ],
});
userschema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userschema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/register", (req, res) => {
  res.render("register.ejs");
});
app.post("/register", (req, res) => {
  const user = {
    username: req.body.username,
    name: req.body.name,
  };
  User.register(new User(user), req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/tweets");
      });
    }
  });
});
app.get("/", (req, res) => {
  res.render("index.ejs");
});
app.get("/login", (req, res) => {
  res.render("login.ejs");
});
app.get("/tweets", (req, res) => {
  if (req.isAuthenticated()) {
    User.findOne(req.user._id).then((data) => {
      if (data) {
        User.findById({ $ne: req.body._id }).then((users) => {
          if (users) {
            res.render("tweets.ejs", { user: data, users: users });
          }
        });
      }
    });
  } else {
    res.redirect("login");
  }
});
app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
      res.redirect("/login");
    } else {
      passport.authenticate("local", { successRedirect: "tweets" })(
        req,
        res,
        function () {
          res.redirect("/tweets");
        }
      );
    }
  });
});
// app.get("/shares",(req,res)=>{

//   if(req.isAuthenticated()){
//     res.render("share.ejs")
//   }
// })
app.post("/share", (req, res) => {
  if (req.isAuthenticated()) {
    const tweet = req.body.Tweet;
    const timestamp = moment().format("MMMM Do YYYY, h:mm:ss a");
    User.findById(req.user._id).then((data, err) => {
      if (data) {
        data.Tweets.push({ content: tweet, timestamp: timestamp });
        data.save().then(() => {
          console.log("tweets saved successfully");
        });
        console.log(data);
      }
      if (err) {
        console.log("not save", err);
      }
    });
    res.redirect("/tweets");
  }
});
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
    }
  });
  res.redirect("/");
});

app.get("/delete", (req, res) => {});
app.get("/logo", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("leftsidebar/logo.ejs");
  }
});

app.get("/profile", (req, res) => {
  if (req.isAuthenticated()) {
    User.findById(req.user._id).then((data, err) => {
      if (data) {
        res.render("leftsidebar/profile.ejs", { user: data });
      }
    });
  }
});

app.get("/profileupdate", (req, res) => {
  if (req.isAuthenticated()) {
    User.findById(req.user._id).then((data, err) => {
      if (data) {
        res.render("profileupdate.ejs");
      }
    });
  }
});
app.post("/profileupdate", (req, res) => {
  if (req.isAuthenticated()) { 
    const username=req.body.username;

    const Email=req.body.email; 
    const id=req.user._id;   
  console.log(username ,Email ,id)
  res.redirect("/profile")
  }
});

app.listen(port, () => {
  console.log(`port is running on ${port}`);
});

// public folder m static file rahetaha hai like css wala and views k under jo
//  folder hai partials uske under jo file hai wo common to all ejs file
// app.post("/register", (req, res) => {
//   User.register({ username: req.body.email }, req.body.password, function(err, user) {
//     if (err) {
//       console.log(err);
//       res.redirect("/register");
// } else {
//   passport.authenticate("local", function(err, user, info) {
//     if (err) {
//       console.log(err);
//       return next(err);
//     }
//     if (!user) {
//       return res.redirect("/register");
//     }
//     req.logIn(user, function(err) {
//       if (err) {
//         console.log(err);
//         return next(err);
//       }
//       return res.redirect("/tweets");
//     });
//   })(req, res);
// }
//   });
// });
