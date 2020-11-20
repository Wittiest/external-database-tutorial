const { Datastore } = require('@google-cloud/datastore');
const { Gstore } = require('gstore-node');

const datastore = new Datastore();
const gstore = new Gstore();

gstore.connect(datastore);

module.exports = { gstore };
