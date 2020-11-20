const express = require('express');

const Authenticate = require('../utilities/authenticate');
const ProfileController = require('../controllers/ProfileController');

const profileRoutes = express.Router();

profileRoutes
  .get('/:userId', Authenticate, ProfileController.get)
  .post('/:userId', Authenticate, ProfileController.upsert);

module.exports = profileRoutes;
