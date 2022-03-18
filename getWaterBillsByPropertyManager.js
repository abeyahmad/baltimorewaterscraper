var waterschema = require(__dirname + '\\data\\waterschema.json')
var WaterBill = require(__dirname + '\\getWaterBill.js')
process.setMaxListeners(Infinity)

var wb = new WaterBill()

var fs = require('fs')
wb.getWaterBillsByPropertyManager('22 S HOWARD ST')
// wb.getWaterBillByAccountNumber('02350894008').then((bill) => {
//     knex('water_bill').insert(bill).then((res) => {
//         console.log(res)
//     })
// })
// knex.from('water_account').where('mailing_address','LIKE','%400 W FRANKLIN ST%').limit(50).then((accounts)=> {
//     accounts.forEach((account) => {
//         console.log(account)
//         wb.getWaterBillByAccountNumber(account.account_number).then((bill) => {
//             knex('water_bill').insert(bill).then((result) => {
//                 console.log(result)
//             })
//         })

//     })
    
// })