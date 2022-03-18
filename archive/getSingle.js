var waterschema = require(__dirname + '\\data\\waterschema.json')
var properties = require(__dirname + '\\data\\properties.json')
var WaterBill = require(__dirname + '\\getWaterBill.js')
const { v4: uuidv4 } = require('uuid');
process.setMaxListeners(Infinity)


var wb = new WaterBill()
wb.getWaterBill('1207 W MULBERRY ST').then((bill)=> {
    // bill.created = new Date();
    // water_bill.doc(uuidv4()).set(bill).then((val)=> console.log(val))
},(err) => {
    console.log('error')
    console.log(err)
}).catch(err=>{
    console.log(property.data().Address)
})