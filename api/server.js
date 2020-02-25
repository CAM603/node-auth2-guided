const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');

// 1
const KnexStore = require('connect-session-knex')(session); //2

const authRouter = require('../auth/auth-router.js');
const usersRouter = require('../users/users-router.js');
const restricted = require('../auth/restricted-middleware.js');
const knex = require('../database/dbConfig'); // 3 needed fro storing sessions in the database

const server = express();

const sessionConfig = {
  name: 'sloth',
  secret: 'shhhhhh',
  resave: false,
  saveUninitialized: true, // Related to GDPR compliance
  cookie: {
    maxAge: 1000 * 60 * 10,
    secure: false, // Should be true in production
    httpOnly: true // true means JS can't touch the cookie
  },
  store: new KnexStore({
    knex,
    tablename: 'sessions',
    createtable: true,
    sidfieldname: 'sid',
    clearInterval: 1000 * 60 * 15,
  }),
}

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig)) // Turns on session middleware
// req.session object is now created by express-session

server.use('/api/auth', authRouter);
server.use('/api/users', restricted, usersRouter);

server.get('/', (req, res) => {
  console.log(req.session)
  res.json({ api: 'up' });
});

module.exports = server;
