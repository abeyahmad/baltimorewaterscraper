var waterschema = require(__dirname + '\\data\\waterschema.json')
// var properties = require(__dirname + '\\data\\properties.json')
var WaterBill = require(__dirname + '\\getWaterBill.js')
var fs = require('fs');
const csv = require('csv-parser')
const {
    v4: uuidv4
} = require('uuid');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
    path: 'report.csv',
    header: [
        {id: 'account_number', title: 'account_number'},
        {id: 'service_address', title: 'service_address'},
        {id: 'current_bill_amount', title: 'current_bill_amount'},
        {id: 'previous_balance', title: 'previous_balance'},
        {id: 'current_balance', title: 'current_balance'},
        {id: 'current_bill_date', title: 'current_bill_date'},
        {id: 'current_read_date', title: 'current_read_date'},
        {id: 'previous_read_date', title: 'previous_read_date'},
        {id: 'last_pay_date', title: 'last_pay_date'},
        {id: 'last_pay_amount', title: 'last_pay_amount'},
        {id: 'balance_diff', title: 'balance_diff'},
        {id: 'penalty_date', title: 'penalty_date'},
        {id: 'created', title: 'created'},
    ]
});
process.setMaxListeners(Infinity)
var prms = []
const results = [];
bills = []
var wb = new WaterBill()
fs.createReadStream(__dirname + '\\data\\2021_Baltimore_City_MD_Advertising_File_200.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
        console.log(results);
        results.forEach((property) => {
            console.log(property['PROPERTY ADDRESS'])
            console.log(results.length)
            prms.push(wb.getWaterBill(property['PROPERTY ADDRESS']).then((bill) => {
                bill.created = new Date();
                console.log(bill);
                bills.push(bill);
            }, (err) => {
                console.log('error')
                console.log(err)
            }).catch(err => {
                console.log(err)
            }))
        })
        Promise.allSettled(prms).then((chillin)=> {
            csvWriter.writeRecords(bills).then(() => {
                console.log('...Done');
            });
        })
    });

// db.collection('Properties').get().then((properties)=>{
//     properties.forEach((property)=>{
//         if(property.data().Address == '1719 Montepelier St') return
//         wb.getWaterBill(property.data().Address).then((bill)=> {
//             bill.property = property.ref;
//             bill.created = new Date();
//             water_bill.doc(uuidv4()).set(bill).then((val)=> console.log(val))
//         },(err) => {
//             console.log('error')
//             console.log(err)
//         }).catch(err=>{
//             console.log(property.data().Address)
//         })
//     })
// })