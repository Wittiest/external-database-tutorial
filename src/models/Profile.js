const { instances } = require('gstore-node');

const { gstore } = require('./db');
const { Schema } = gstore;

const profileSchema = new Schema({
  experiencePoints: { type: Number, required: true }
});

module.exports = gstore.model('Profile', profileSchema);
