require('dotenv').config();
const pgp = require('pg-promise')();
//const isProduction = process.env.NODE_ENV === 'production';
const db = pgp(`postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`)

module.exports = db;