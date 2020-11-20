const { gstore } = require('../models/db');
const Profile = require('../models/Profile');

class ProfileController {
  // Update or create a profile record entry for a given roblox userId
  static async upsert(req, res) {
    const userId = req.params.userId
    const { experiencePoints } = req.body;

    const profile = new Profile({ experiencePoints }, userId);

    const { error } = profile.validate();

    if (error) {
      return res.status(422).send(error)
    }

    await profile.save();

    res.status(200).send(profile.plain());
  }

  // Fetch a profile for a given roblox userId
  static async get(req, res) {
    const userId = req.params.userId

    let profile;
    try {
      profile = await Profile.get(userId);
    } catch (e) {
      if (e.code === gstore.errors.codes.ERR_ENTITY_NOT_FOUND) {
        return res.status(404).send({
          error: `Profile data for userId ${userId} not found`
        });
      } else {
        res.status(500).send({error: e.message})
      }
    }

    res.status(200).send(profile.plain());
  }
}

module.exports = ProfileController
