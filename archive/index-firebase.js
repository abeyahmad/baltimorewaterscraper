var waterschema = require(__dirname + '\\data\\waterschema.json')
var properties = require(__dirname + '\\data\\properties.json')
var WaterBill = require(__dirname + '\\getWaterBill.js')
const { v4: uuidv4 } = require('uuid');
process.setMaxListeners(Infinity)

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
var wb = new WaterBill()
const db = admin.firestore();
const water_bill = db.collection('water_bill');
db.collection('Properties').get().then((properties)=>{
    properties.forEach((property)=>{
        if(property.data().Address == '1719 Montepelier St') return
        wb.getWaterBill(property.data().Address).then((bill)=> {
            bill.property = property.ref;
            bill.created = new Date();
            water_bill.doc(uuidv4()).set(bill).then((val)=> console.log(val))
        },(err) => {
            console.log('error')
            console.log(err)
        }).catch(err=>{
            console.log(property.data().Address)
        })
    })
})
