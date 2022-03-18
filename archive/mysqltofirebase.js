const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
var waterschema = require(__dirname + '\\data\\waterschema.json')
var properties = require(__dirname + '\\data\\properties.json')
var WaterBill = require(__dirname + '\\getWaterBill.js')
const {
  v4: uuidv4
} = require('uuid');


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();


var knex_config = require(__dirname + '\\config\\knex.json')
var Promise = require("bluebird");
var knex = require('knex')(knex_config);

knex.select().table('water_bill').then((res) => {
  var arr = []
  res.forEach((row) => {
    var obj = JSON.parse(JSON.stringify(row))
    console.log(obj)
    const aTuringRef = db.collection('water_bill').doc(uuidv4());
    arr.push(aTuringRef.set(obj))
  })
  Promise.all(arr).then((lol) => {
    knex.destroy()
  })
})