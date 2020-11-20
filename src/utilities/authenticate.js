const SecretsManagerAdapter = require('../adapters/SecretsManagerAdapter');

const API_AUTH_KEY = 'api-auth-key';

let key;

const Authenticate = async (req, res, nextFunction) => {
	if (!key) { key = await SecretsManagerAdapter.fetch(API_AUTH_KEY); }

	if (req.body.key === key || req.query.key === key) {
		nextFunction();
	} else {
    res.status(401).send({ error: 'Invalid authentication key.' });
	}
}

module.exports = Authenticate;
