'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MessageSchema = new Schema({
  sender: String,
  acceptor: String,
  dialog: String,
  text: String,
  date: Date,
  statusSender: String,
  statusAcceptor: String
});

module.exports = mongoose.model('Message', MessageSchema);