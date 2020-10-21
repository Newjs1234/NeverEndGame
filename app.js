const http = require('http');

const express = require('express'),
      bodyParser = require('body-parser'),
      session = require('express-session'),
      ejs = require('ejs'),
      cookieParser = require('cookie-parser');

const game = require('./routers/game');

const port = 3210;
const app = express();
app.set('view engine', 'ejs');
app.use(cookieParser());

const TWO_HOURS = 1000 * 60 * 60 * 2;

const {
    NODE_ENV = 'development',

    SESS_NAME = 'sid',
    SESS_SECRET = 'ssh!quiet,it\'asecret',
    SESS_LIFETIME = TWO_HOURS
} = process.env

const IN_PROD = NODE_ENV === 'production'

app.use(bodyParser.urlencoded({
    extended: true
}))

// Session
app.use(session({
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
        naxAge: SESS_LIFETIME,
        sameSite: true,
        secure: IN_PROD
    }
}))

app.use('/user', express.static('public'));

app.use('/', game)


const server = http.createServer(app);

server.listen(port, () => {
    console.log(port);
})