var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const session = require('express-session')
const moment = require('moment');
const multer = require('multer')
const upload = multer({dest: 'uploads/'})
const expressValidator = require('express-validator');
const mongo = require('mongodb');

// here we are requiring monk by using db as a variable
// then we are going to use localhost/nodeblog to 
// tell nodejs that we are going to use the local server
// and then we are going to have a name nodeblog as the 
// name of our server
// NO NEED TO MANUALLY CREATE THE SERVER
// THE APPLICATION WILL MANUALLY CREATE FOR US
const db = require('monk')('localhost/nodeblog');





var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// express sessions middleware
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}))


// express middleware validator
app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
    var namespace = param.split('.'),
      root = namespace.shift(),
      formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));


// THIS IS TO TELL NODEJS THAT WE ARE GOING TO 
// USE CONNECT FLASH FOR OUR APPLICATION TO 
// SHOW MESSAGES 
app.use(require('connect-flash')());
app.use((req, res, next)=>{
  res.locals.messages = require('express-messages')(req, res);
  next(); 
})



// THIS MIDDEWARE IS TO MAKE OUR DATABASE ACCESSIBLE TO 
// OUR ROUTER
app.use((req, res, next)=>{
  req.db = db;
  next();
})



app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
