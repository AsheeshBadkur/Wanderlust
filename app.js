const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');
const ejs = require('ejs');
const ejsMate = require('ejs-mate');
const app = express();
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore=require("connect-mongo").default;
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
const listingsRouter=require("./routes/listing.js");
const reviewsRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

const MONGO_URL=process.env.DB_URL

const store = MongoStore.create({
    mongoUrl:MONGO_URL,
    crypto:{
        secret:process.env.SESSION_SECRET,
    },
    touchAfter:24*60*60,
    });

store.on("error",function(e){
    console.log("SESSION STORE ERROR!",e);
});

const sessionOptions = {
    store,
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
};

main()
.then(() => {
    console.log('Connected to MongoDB');
})
.catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.use(session(sessionOptions));
app.use(flash());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(passport.initialize());
app.use(passport.session());



app.use((req, res, next) => {
  console.log("REQ.USER in middleware =>", req.user); 
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;  
  next();
});

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);

//Route Server
// app.get('/',(req, res) => {
//     res.send('Server is up and running!');
// });

app.use( (req,res,next)=>{
    next(new ExpressError(404,"PAGE NOT FOUND!"));
});

app.use((err,req,res,next)=>{
    let{statusCode=500, message="Something went wrong"}=err;
    res.status(statusCode).render("error.ejs",{message});
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
