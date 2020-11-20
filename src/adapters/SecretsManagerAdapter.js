const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

// Modify YOUR_PROJECT_ID to match your project id
const APPLICATION_SECRETS_PREFIX = "projects/YOUR_PROJECT_ID/secrets";

class SecretsManagerAdapter {
  static async fetch(keyName) {
    const secretKeyName = `${APPLICATION_SECRETS_PREFIX}/${keyName}`;

  	const client = new SecretManagerServiceClient();

  	const [accessResponse] = await client.accessSecretVersion({
      name: `${secretKeyName}/versions/latest`,
    });

  	const key = accessResponse.payload.data.toString('utf8');
    console.info(`Successfully fetched ${keyName}`);

    return key;
  }
}

module.exports = SecretsManagerAdapter;
