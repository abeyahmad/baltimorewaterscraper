import pLimit from 'p-limit';
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
fs.createReadStream(__dirname + '\\data\\all_properties.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
        console.log(results);
        results.forEach((property) => {
            console.log(property['PropertyAddress'])
            console.log(results.length)
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