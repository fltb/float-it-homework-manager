const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require("express-session");
const { xss } = require('express-xss-sanitizer');
const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');
const registerRouter = require('./routes/register');
const problemRouter = require('./routes/problem');
const logoutRouter = require("./routes/logout");
const adminRouter = require("./routes/admin");

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(xss());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: Math.random().toString(16).substring(2, 16),
  name: "my-session-id",
  cookie: { maxAge: 60000, sameSite: true},
  resave: false, 
  saveUninitialized: true
}));


app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/problem', problemRouter);
app.use('/logout', logoutRouter);
app.use('/admin', adminRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
