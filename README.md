# External Databases with Google App Engine

0. [Overview](#overview)
1. [Creating a Google Account with access to App Engine](#creating-a-google-account-with-access-to-app-engine)
2. [Development Environment Setup](#development-environment-setup)
3. [Initialize Tutorial Project](#initialize-tutorial-project)
4. [Tutorial Steps](#tutorial-steps)

## Overview

This project is going to walk us through creating an API with Google App Engine which allows us to persist data and fetch that data.

Specifically, we're going to use the example of user profiles with experience points and show how to fetch and update these values from different Roblox games, showing an example of a leveling system which is cross-game or cross-platform.

Please note, this tutorial is primarily intended for a beginner audience. In some cases we've chosen simplicity over efficiency for this reason.

## Creating a Google Account with access to App Engine

1. Create a Google Account
2. Initiate a free trial with Google App Engine [here](https://cloud.google.com/appengine). Unfortunately, you will need a credit card to verify your account, but you shouldn't receive any charges.

After verifying your account, you should be ready to move forward

## Development Environment Setup

Follow the [google cloud nodejs quickstart guide](https://cloud.google.com/appengine/docs/standard/nodejs/quickstart).

After following through this guide, you should have completed the following:
- Installed the google cloud sdk to your terminal and authenticated to receive local credentials to access your cloud resources with `gcloud auth login`
- Created an initial project
- Installed git
- Followed the [nodejs setup guide](https://cloud.google.com/nodejs/docs/setup)

To validate that everything is ready to go, please follow the full tutorial to validate you can authenticate, deploy, etc.

I'd suggest you also install an IDE. Google provides a [list](https://cloud.google.com/nodejs/docs/setup#installing_an_editor) of a few top IDEs. Personally I love the open source tool [Atom](https://atom.io/)

## Initialize Tutorial Project

Let's start by creating a new project (or using your existing one) for our tutorial.

1. `gcloud projects create [YOUR_PROJECT_ID] --set-as-default`
2. `gcloud app create --project=[YOUR_PROJECT_ID]`
    - Select a region for your app, I'm going with `us-west2`
3. `git clone https://github.com/Wittiest/datastore-tutorial.git`
4. `cd datastore-tutorial`
5. `npm install`

## Tutorial Steps
Please note, the `main` branch of the repository is essentially Milestone 0. There is a branch for each milestone on GitHub so that you can check your progress.


- [Milestone 1](#milestone-1)
- [Milestone 2](#milestone-2)
- [Milestone 3](#milestone-3)
- [Milestone 4](#milestone-4)
- [Milestone 5](#milestone-5)

### Milestone 1
This milestone involves hosting the app locally and deploying it to app engine.

1. Host your app locally
  - Run `npm start`
  - Visit http://localhost:8080/ and validate that you see the welcome message
2. Deploy your app
  - Run `gcloud app deploy app.yaml`
  - Run `gcloud app browse` and validate that you see the welcome message

### Milestone 2
This milestone involves creating API endpoints that can fetch and update our user's profile. We'll need to set up these endpoints, encapsulate our data in models, and persist them to the datastore.

We'll be using [gstore-node](https://sebloix.gitbook.io/gstore-node/) which is a wrapper for Google Datastore, similar to Mongoose for mongodb.

#### Creating Data Models

##### Connecting to the datastore

1. Inside of our `src` folder, create a folder named `models` with a file named `db.js`
2. Inside of `db.js` add the following code:
  ```javascript
  const { Datastore } = require('@google-cloud/datastore');
  const { Gstore } = require('gstore-node');

  const datastore = new Datastore();
  const gstore = new Gstore();

  gstore.connect(datastore);

  module.exports = { gstore };
  ```
Here, we're wrapping the normal Datastore with Gstore which will allow us to define model schemas and interact with the database more easily

##### Creating the Profile Model

1. Inside of `src/models` add a file named `Profile.js`
2. Inside of `Profile.js`, add the following code:

  ```javascript
  const { instances } = require('gstore-node');

  const { gstore } = require('./db');
  const { Schema } = gstore;

  const profileSchema = new Schema({
    experiencePoints: { type: Number, required: true }
  });

  module.exports = gstore.model('Profile', profileSchema);
  ```

  Here, we're importing the database wrapper that we created before and using an instance of the Schema class to define our data model.

  We're only going to store experiencePoints for now, and we've added some validation parameters which will throw an exception if we try to save a Profile without experiencePoints or with experiencePoints that have a value which is a non-Number

#### Creating Controllers

  Now we need to write our application logic for handling the different scenarios in our API. Sometimes we're going to want to fetch profile data, and other times we're going to want to save profile data. A "Controller" will handle different types of request for a model (or models), but will allow the model itself to interact directly with the database.

  1. Inside of our `src` folder, create a folder named `controllers`
  2. Inside of `src/controllers` add a file named `ProfileController.js`
  3. Inside of `ProfileController.js` add the following code:

  ```javascript
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
  ```

  With the `upsert` method in the ProfileController, we're doing the following:
    - Packaging our data in the Profile model
    - Validating the model using the schema we created before
    - If there are any validation errors, return a 422 error code
    - Otherwise, move forward with saving the profile data
    - Return a plain JSON object as part of our API response

  With the `get` method, we're doing the following:
    - Attempting to fetch the profile data for a userId
    - If we cannot find profile data for the ID, return a 404 error
    - Otherwise, return the profile data as a JSON object in our API response

#### Creating API Routes

  Your requests to your locally hosted server will be going to `localhost:8080/PATH` and the requests to your hosted server will be going to some URL like `https://MY-PROJECT-NAME.wl.r.appspot.com/PATH`. Depending on the path you provide and the type of request (GET, POST, PATCH, ...) you can have your API respond differently.

  Our API routes will be used to match incoming requests to a specific controller method for handling.

  1. Inside of our `src` folder, create a folder named `routes`
  2. Inside of `src/routes` add a file named `profiles.js`
  3. Inside of `profiles.js` add the following code:

  ```javascript
  const express = require('express');

  const ProfileController = require('../controllers/ProfileController');

  const profileRoutes = express.Router();

  profileRoutes
    .get('/:userId', ProfileController.get)
    .post('/:userId', ProfileController.upsert);

  module.exports = profileRoutes;
  ```

  4. Modify your `app.js` file to look like this:

  ```javascript
  const express = require('express');
  const profileRoutes = require('./routes/profiles');

  const PORT = process.env.PORT || 8080;

  const app = express();

  app.use(express.json())
  app.use('/profiles', profileRoutes);

  app.get('/', (req, res) => {
    res.status(200).send("Welcome to our server!!!");
  });

  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}\nPress Ctrl+C to quit.`);
  });

  module.exports = app;
  ```

  With these changes, we're routing our incoming requests to `/profiles` to the profilesRouter which will redirect the request to the profilesController for handling.

#### Testing our API locally

Now our API should be fully ready to receive requests and persist / retrieve profile data for our users.

To test your API, I suggest installing [Postman](https://www.postman.com/downloads/). It is an application which allows you to easily perform local or remote testing with different types of requests. We'll be using it for HTTP GET requests (for retrieving data) and HTTP POST requests (for saving data).

##### Setting up our local datastore emulator
Run the following commands:
1. `gcloud auth application-default login`
2. `gcloud beta emulators datastore start`
3. `gcloud beta emulators datastore env-init`

At the conclusion your datastore emulator should be working and you're ready to test your API

##### Testing with Postman

1. First let's run `npm start` to get our app up and running with our new code changes.
  - It should be listening for incoming requests on `localhost:8080`
2. Open Postman
3. Create a new Request with the following parameters:
  - Select POST from the dropdown (the default is GET)
  - Change the url to `localhost:8080/profiles/1`
  - Select the `Body` tab
  - Select `raw` and input the following:
    ```json
    {
      "experiencePoints": 11
    }
    ```
  - Click `SEND`
    - You should get a response which looks like:
      ```json
      {
        "id": "1",
        "experiencePoints": 11
      }
      ```
4. Change the Request type from `POST` to `GET`
5. Click `SEND`
    - You should get a response which looks like:
      ```json
      {
        "id": "1",
        "experiencePoints": 11
      }
      ```

Success! If you got this far that means your API is up and running locally and you're able to persist + retrieve data from your local datastorage.

You may have noticed that right now **anyone** can send a request to your API and change these profile values. This is bad news! We're going to make a final change to fix this before deploying our code for testing on your Google App Engine instance.

### Milestone 3
This milestone involves adding authentication to our api endpoints for security. A key will be required to fetch and update profile data.

For the use case of ROBLOX servers interacting with our API, it's simple enough for us to just create one unguessable API key and send this as part of the requests from our servers. There are more robust mechanisms of authenticating with APIs, but we'll take this shortcut for the tutorial.

#### Secrets Manager

Let's start by visiting the [cloud console's secret manager page](https://console.cloud.google.com/security/secret-manager).

1. Create a new secret with the name `api-auth-key`
2. Generate an access key
  - If on macos, just run `uuidgen` in Terminal
  - Otherwise, you can visit [uuidgenerator](https://www.uuidgenerator.net/version4)
3. Save the secret

Now we'll need to give our app engine the IAM permissions to access the secret
1. Run `gcloud iam service-accounts list`
  - You should see an "App Engine default service account"
  - Record the email for this account for the next command
2. Run `gcloud projects add-iam-policy-binding YOUR_PROJECT_ID --member=serviceAccount:YOUR_SERVICE_ACCOUNT_EMAIL --role=roles/secretmanager.secretAccessor`
  - Replace YOUR_PROJECT_ID with the name of your project
  - Replace YOUR_SERVICE_ACCOUNT_EMAIL with the email you listed above

Now we're going to write the code to let us interact with Secrets Manager.

1. Inside of our `src` folder, create a folder named `adapters`
2. Inside of `src/adapters` add a file named `SecretsManagerAdapter.js`
3. Inside of `SecretsManagerAdapter.js` add the following code:

  ```javascript
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

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
  ```
4. Replace `YOUR_PROJECT_ID` with your project id.

#### Authentication Middleware

Now that we have the code to fetch our API key from Secrets Manager, we just need to create the code which intercepts our incoming requests and validates that they have the API key.

1. Inside of our `src` folder, create a folder named `utilities`
2. Inside of `src/utilities` add a file named `authenticate.js`
3. Inside of `authenticate.js` add the following code:

  ```javascript
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
  ```

  You can see that this module will fetch our API key once from secrets manager, but after that it will remain cached for following incoming requests.


We're going to inject this authentication middleware inside of the routes that we want to protect:

```javascript
const express = require('express');

const Authenticate = require('../utilities/authenticate');
const ProfileController = require('../controllers/ProfileController');

const profileRoutes = express.Router();

profileRoutes
  .get('/:userId', Authenticate, ProfileController.get)
  .post('/:userId', Authenticate, ProfileController.upsert);

module.exports = profileRoutes;
```

#### Testing Authenticated Routes

If you send the GET or POST requests from the previous milestone, you should receive a 401 error code in response to your request.

You can authenticate correctly by doing the following:
- For GET requests
  - Include a `key` query param with your request like this:
    - `localhost:8080/profiles/2?key={VALUE_OF_YOUR_SECRET_KEY}`
- For POST requests
  - Include a `key` key inside of the JSON body like this:
    ```json
    {
      "experiencePoints": 15,
      "key": "VALUE_OF_YOUR_SECRET_KEY"
    }
    ```

### Milestone 4
This milestone involves our final deployment and testing of our deployed API with postman

At this point you have created an API which allows you to modify a profile stat (experience) of a player via an ID and retrieve that profile data. It's time to deploy this to Google App Engine and test it!

Run `gcloud app deploy app.yaml`

After your app has finished deploying you can type in `gcloud app browse` to visit the welcome message, but we'll probably want to use POSTMAN for our testing.

You can send the same GET and POST requests from before, except this time you'll need to be sending them to the url of your app. So rather than `localhost:8080/profiles` you'll be sending requests to a domain like `https://{YOUR_PROJECT_ID}.wl.r.appspot.com/profiles`

Now that you've validated your API is up and running, it's time to hook up your Roblox Servers

### Milestone 5
This milestone involves creating a Roblox Game which will use HTTPService to communicate with our API

1. Create a new place or use an existing place in Roblox Studio
2. Visit File > Game Settings
3. Toggle on Allow HTTP Requests
4. Create a new module script named `ProfileAPIModule` with this code:
  ```lua
  local HttpService = game:GetService("HttpService")
  local BASE_URL = 'YOUR_BASE_URL'
  local PROFILES_URL = BASE_URL..'/profiles/'
  local API_KEY = 'YOUR_API_KEY'

  local ProfileAPIModule = {
  	getProfileData = function(userId)
  		local profileData

  		local success, error = pcall(function()
  			profileData = HttpService:GetAsync(PROFILES_URL..userId..'?key='..API_KEY)			
  		end)

  		if error then
  			print(error)
  			return nil
  		end

  		local profile = HttpService:JSONDecode(profileData)

  		return profile
  	end,
  	saveProfileData = function(userId, experiencePoints)
  		local profileData = {experiencePoints = experiencePoints, key = API_KEY}
  		local encodedData = HttpService:JSONEncode(profileData)

  		local response

  		local success, error = pcall(function()
  			response = HttpService:PostAsync(PROFILES_URL..userId, encodedData)		
  		end)

  		if error then
  			print(error)
  			return nil
  		end

  		return response
  	end
  }

  return ProfileAPIModule
  ```

5. Create a new script named `ProfileManager` with this code:
  ```lua
  local ProfileAPI = require(script.Parent.ProfileAPIModule)

  local profileDataForPlayer1 = ProfileAPI.getProfileData(1)
  print(profileDataForPlayer1["id"], profileDataForPlayer1["experiencePoints"])

  local profileDataForPlayerWithNoData = ProfileAPI.getProfileData(111)

  if profileDataForPlayerWithNoData == nil then
  	print("Couldn't find profile data for player 111")
  end

  ProfileAPI.saveProfileData(5, 20)
  local profileDataForPlayer5 = ProfileAPI.getProfileData(5)

  print(profileDataForPlayer5["experiencePoints"].."== 20")
  ```

When you play, you should see via print statements in the output that everything is working!
