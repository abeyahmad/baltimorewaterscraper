var waterschema = require(__dirname + '\\data\\waterschema.json')
var properties = require(__dirname + '\\data\\properties.json')
var WaterBill = require(__dirname + '\\getWaterBill.js')
process.setMaxListeners(Infinity)
var property = process.argv[2]
var amount = process.argv[3]
console.log(property);
var wb = new WaterBill()
wb.payWaterBill(property,amount).then((bill)=> {
    // bill.created = new Date();
    // water_bill.doc(uuidv4()).set(bill).then((val)=> console.log(val))
},(err) => {
    console.log('error')
    console.log(err)
}).catch(err=>{
    console.log(property.data().Address)
})