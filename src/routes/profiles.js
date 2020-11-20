const express = require('express');

const ProfileController = require('../controllers/ProfileController');

const profileRoutes = express.Router();

profileRoutes
  .get('/:userId', ProfileController.get)
  .post('/:userId', ProfileController.upsert);

module.exports = profileRoutes;
