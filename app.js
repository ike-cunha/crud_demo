var express = require('express')
var app = express()
var mysql = require('mysql')
 

var myConnection  = require('express-myconnection')
var config = require('./config')
var dbOptions = {
    host:      config.database.host,
    user:       config.database.user,
    password: config.database.password,
    port:       config.database.port, 
    database: config.database.db
}

app.use(myConnection(mysql, dbOptions, 'pool'))
app.set('view engine', 'ejs')

var index = require('./routes/index')
var users = require('./routes/users')
 
var expressValidator = require('express-validator')
app.use(expressValidator())
 
 
/**
 * body-parser module is used to read HTTP POST data
 * it's an express middleware that reads form's input 
 * and store it as javascript object
 */ 
var bodyParser = require('body-parser')
/**
 * bodyParser.urlencoded() parses the text as URL encoded data 
 * (which is how browsers tend to send form data from regular forms set to POST) 
 * and exposes the resulting object (containing the keys and values) on req.body.
 */ 
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
 
 
/**
 * This module let us use HTTP verbs such as PUT or DELETE 
 * in places where they are not supported
 */ 
var methodOverride = require('method-override')
 
/**
 * using custom logic to override method
 * 
 * there are other ways of overriding as well
 * like using header & using query value
 */ 
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method
    delete req.body._method
    return method
  }
}))
 
/**
 * This module shows flash messages
 * generally used to show success or error messages
 * 
 * Flash messages are stored in session
 * So, we also have to install and use 
 * cookie-parser & session modules
 */ 
var flash = require('express-flash')
var cookieParser = require('cookie-parser');
var session = require('express-session');
 
app.use(cookieParser('signedCookies'))
app.use(session({ 
    secret: 'signedCookies',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))
app.use(flash())
 
 
app.use('/', index)
app.use('/users', users)
 
app.listen(3000, function(){
    console.log('Server running at port 3000: http://127.0.0.1:3000')
})