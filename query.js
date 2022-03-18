var knex = require('knex')({
    client: 'mysql',
    connection: {
        host: 'baltimore.cbwu6qn3r4im.us-east-2.rds.amazonaws.com',
        user: 'admin',
        password: 'I09231990a',
        database: 'baltimore'
    }
});
var _ = require('lodash')

class BWQuery {
    constructor() {
    }
    getAllTransactions(account_number) {
        return knex.select().from('water_bill').where('account_number', account_number).orderBy('created', 'asc').then((val) => {
            // console.log(val);
            return JSON.parse(JSON.stringify(val));
            // knex.destroy()
        });
    }
    getUniqueReadings(account_number) {
        this.getAllTransactions(account_number).then((rows) => {
            var date_arr = [];
            tx_arr = [];
            for (var tx in rows) {
                if (date_arr.indexOf(rows[tx].current_read_date) < 0) {
                    date_arr.push(rows[tx].current_read_date);
                    tx_arr.push(rows[tx]);
                }
            }
            return tx_arr;
        });
    }
    getUniquePayments(account_number) {
        this.getAllTransactions(account_number).then((rows) => {
            var date_arr = [];
            tx_arr = [];
            for (var tx in rows) {
                if (date_arr.indexOf(rows[tx].last_pay_date) < 0) {
                    date_arr.push(rows[tx].last_pay_date);
                    tx_arr.push(rows[tx]);
                }
            }
            console.log(tx_arr);
            return tx_arr;
        });
    }
    getDaysProcessed() {
        knex('water_bill').distinct('created').then((val) => {
            console.log(val);
            knex.destroy();
        });
    }
    getEachBill(account_number) {
        this.getAllTransactions(account_number).then((rows) => {
            console.log(rows.length);
            var obj = {};
            rows.forEach((row) => {
                if (!obj.hasOwnProperty(row.current_read_date)) {
                    obj[row.current_read_date] = row;
                }
            });
            console.log(obj);
        });
    }
}

