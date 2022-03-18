var waterschema = require(__dirname + '\\config\\waterschema.json')
var _ = require('lodash')
var puppeteer = require('puppeteer');
var bank_data = require(__dirname + '\\config\\bank.json')
var knex_config = require(__dirname + '\\config\\knex.json')
var Promise = require("bluebird");
var knex = require('knex')(knex_config);
class WaterBill {
    constructor() {
        this.waterschema = waterschema
    }
    async getWaterBills(accounts) {
        console.log(this.waterschema)
        var limit = 150000;
        var chunk_size = 16;
        var chunked_accounts = _.chunk(accounts, chunk_size);
        for (var ch of chunked_accounts) {
            console.time('chunk_processing_time' + chunk_size);
            var bill_chunk = await this.getWaterBillChunk(ch);
            var res = await knex('water_bill').insert(bill_chunk);
            for (var bill of bill_chunk) {
                console.log(bill);
                if (!!bill && !!bill.account_number)
                    var account_res = await knex.from('water_account').where('account_number', bill.account_number).update(bill).catch((err) => {
                        console.log(err);
                    });
                console.log(account_res);
            }
            console.timeEnd('chunk_processing_time' + chunk_size);
        }
        console.timeEnd('recordcount' + limit);
        knex.destroy();
    }
    async getAllWaterBills() {
        var limit = 300000;
        var chunk_size = 16;
        console.time('recordcount' + limit);
        var accounts = await knex('water_account').orderBy('updated', 'asc').limit(limit)
        // console.log(accounts)
        console.log(accounts.length);
        var chunked_accounts = _.chunk(accounts, chunk_size);
        for (var ch of chunked_accounts) {
            console.time('chunk_processing_time' + chunk_size);
            var bill_chunk = await this.getWaterBillChunk(ch);
            var res = await knex('water_bill').insert(bill_chunk);
            for (var bill of bill_chunk) {
                console.log(bill);
                if (!!bill && !!bill.account_number)
                    var account_res = await knex.from('water_account').where('account_number', bill.account_number).update(bill).catch((err) => {
                        console.log(err);
                    });
                console.log(account_res);
            }
            console.timeEnd('chunk_processing_time' + chunk_size);
        }
        console.timeEnd('recordcount' + limit);
        knex.destroy();
    }
    async getWaterBillChunk(chunk) {
        var concurrent_bills = [];
        for (var acct of chunk) {
            concurrent_bills.push(this.getWaterBill(acct.account_number).catch((err) => {
                console.log('we failed');
                console.log(err);
            }));
        }
        return await Promise.all(concurrent_bills);
    }
    async getWaterBill(account) {
        console.log('Getting water bill for account: ' + account);
        var browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ],
            headless: true
        });
        const page = await browser.newPage();
        try {
            var er = false;
            page.goto('https://cityservices.baltimorecity.gov/water', {
                timeout: 5000
            }).catch((err) => {
                er = true;
                console.log('we fail here goto');
                return browser.close();
            });
            if (er)
                return;
            await page.setViewport({
                width: 1366,
                height: 768
            });
            await page.waitForNavigation({
                waitUntil: 'networkidle2',
                timeout: 4384
            }).catch((err) => {
                er = true;
                console.log('we fail here goto page navigation');
                return browser.close();
            });
            if (er)
                return;
            // await page.waitForSelector('#ctl00_ctl00_rootMasterContent_LocalContentPlaceHolder_btnGetInfoAccount',{visible:true}).catch((err)=> {
            //     console.log('we fail here waiting for info button')
            // })
            await page.waitForSelector('#ctl00_ctl00_rootMasterContent_LocalContentPlaceHolder_txtAccountNumber', {
                visible: true,
                timeout: 3000
            });
            await page.type('#ctl00_ctl00_rootMasterContent_LocalContentPlaceHolder_txtAccountNumber', account);
            page.click('#ctl00_ctl00_rootMasterContent_LocalContentPlaceHolder_btnGetInfoAccount').catch(function (err) {
                console.log('fail on click search');
                er = true;
                return browser.close();
            });
            if (er)
                return;
            var res = await page.waitForNavigation({
                waitUntil: 'networkidle2',
                timeout: 4000
            }).catch(function (err) {
                console.log('fail on wait for nav button');
                return browser.close();
            });
            if (er)
                return;
            // await page.waitForNetworkIdle()
            // await Promise.all([page.click('#ctl00_ctl00_rootMasterContent_LocalContentPlaceHolder_btnGetInfoAccount'), page.waitForNavigation({
            //     waitUntil: 'networkidle2'
            // })]).catch(function(err) {
            //     console.log(err)
            //     console.log('we error at button then nav')
            // })
            var error_message = '';
            var failed = false;
            await page.waitForSelector('#ctl00_ctl00_rootMasterContent_LocalContentPlaceHolder_pnlBillDetail', {
                timeout: 4243
            });
            if (failed == true)
                return;
            var water_bill = {};
            for (var key in this.waterschema) {
                try {
                    water_bill[key] = await page.$eval('#' + waterschema[key], body => body.innerText);
                } catch (err) {
                    console.log('Failed: ' + account);
                }
            }
            console.log(account + ' - resolved');
            new WaterBill().convertData(water_bill);
        } catch (err) {
            console.log(err);
        }
        await browser.close();

        return Promise.resolve(water_bill);
    }
    async getWaterBillsByPropertyManager(pm) {
        var accounts = await knex.from('water_account').where('mailing_address', 'LIKE', '%' + pm + '%');
        var chunked_accounts = _.chunk(accounts, 10);
        console.log('we get here');
        for (var ch of chunked_accounts) {
            var bill_chunk = await this.getWaterBillChunk(ch).catch((err) => {
                console.log('failled batch');
            });
            var res = await knex('water_bill').insert(bill_chunk);
            for (var bill of bill_chunk) {
                await knex.from('water_account').where('account_number', bill.account_number).update(bill);
            }
        }
        knex.destroy();
    }
    async payWaterBill(property, amount) {
        console.log('Getting water bill for property: ' + property);
        const browser = await puppeteer.launch({
            headless: false
        });
        const page = await browser.newPage();
        await page.goto('https://cityservices.baltimorecity.gov/water', {
            waitUntil: 'networkidle2'
        });
        await page.type('[title="Service Address"]', property);
        await Promise.all([page.click('#ctl00_ctl00_rootMasterContent_LocalContentPlaceHolder_btnGetInfoServiceAddress'), page.waitForNavigation({
            waitUntil: 'networkidle2'
        })]);
        await page.waitForSelector('#ctl00_ctl00_rootMasterContent_LocalContentPlaceHolder_lblLastBillAmount', {
            visible: true
        }).catch(err => console.log(err));
        var water_bill = {};
        for (key in this.waterschema) {
            water_bill[key] = await page.$eval('#' + waterschema[key], body => body.innerText);
        }
        page.click('#ctl00_ctl00_rootMasterContent_LocalContentPlaceHolder_btnPayWithAccount');
        await page.waitForNavigation({
            waitUntil: 'networkidle2'
        });
        await page.waitForRequest('https://cityservices.baltimorecity.gov/paysys/ViewPayment.aspx');
        console.log('we got request');
        await page.waitForSelector('#ctl00_ContentPlaceHolder1_UC_ViewPayment1__f_001_txtPayAmount');
        await page.focus('#ctl00_ContentPlaceHolder1_UC_ViewPayment1__f_001_txtPayAmount');
        for (var x = 0; x < 10; x++)
            await page.keyboard.press('Delete');
        await page.type('#ctl00_ContentPlaceHolder1_UC_ViewPayment1__f_001_txtPayAmount', amount);
        await page.waitForSelector('#ctl00_ContentPlaceHolder1_UC_ViewPayment1_btnSubmit');
        console.log('got selector');
        await Promise.all([page.click('#ctl00_ContentPlaceHolder1_UC_ViewPayment1_btnSubmit'), page.waitForNavigation({
            waitUntil: 'networkidle2'
        })]);
        await page.type('#bankaccount_name', bank_data.name);
        await page.type('#routing_number', bank_data.routing_number);
        await page.type('#account_number', bank_data.account_number);
        await page.type('#accountPostalCode', bank_data.zip);
        await page.type('#emailAddress', bank_data.email);
        await page.type('#confirmEmailAddress', bank_data.email);
        await page.select("select#stateCode_1", "MD");
        await page.click('#paytype_pc_PERSONAL\\ CHECKING');
        await Promise.all([page.click('#submitBtnId'), page.waitForNavigation({
            waitUntil: 'networkidle2'
        })]);
        await page.click('input[name=\'termsAndConditions\']');
        await Promise.all([page.click('input[name=\'Submit\']'), page.waitForNavigation({
            waitUntil: 'networkidle2'
        })]);
        // new WaterBill().convertData(water_bill);
        // console.log(water_bill);
        return Promise.resolve(water_bill);

        function getWaterBillScreenshotName(property) {
            var d = new Date();
            var m = d.getMonth() + 1;
            var dir = __dirname + '\\bill_screenshots\\' + property;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            return __dirname + '\\bill_screenshots\\' + property + '\\' + m + d.getDate() + d.getFullYear() + '.png';
        }
    }
    async getStreetAccounts(street) {
        console.log('Getting accounts for street: ' + street);
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://cityservices.baltimorecity.gov/water', {
            waitUntil: 'networkidle2'
        });
        await page.type('[title="Service Address"]', street);
        await Promise.all([page.click('#ctl00_ctl00_rootMasterContent_LocalContentPlaceHolder_btnGetInfoServiceAddress'), page.waitForNavigation({
            waitUntil: 'networkidle2'
        })]);
        await page.waitForSelector('table tr td', {
            visible: true
        }).catch(err => console.log(err));
        const data = await page.evaluate(() => {
            const tds = Array.from(document.querySelectorAll('table tr'));
            return tds.map(td => td.innerText);
        });
        await browser.close();
        // console.log(data);
        return data;
    }
    async getAllStreetAccounts() {
        var wb = this;
        var data = await knex.from('unique_street_name').orderBy('name', 'asc').where('created', '>', '2022-02-15 00:53:08').where('name','>=','WILLOWS FOREST');
 
        for (var street of data) {
            console.log(street.name);
            var err = false;
            var account_data = await this.getStreetAccounts(street.name).catch(function(timeout) {
                console.log('damn this sucks')
                err = true
            })
            if (err) continue
            for (var acct of account_data) {
                console.log(acct)
                var acc_arr = acct.split('\t');
                await knex('water_account').insert({
                    account_number: acc_arr[0],
                    service_address: acc_arr[1],
                    mailing_address: acc_arr[2]
                }).then(function (res) {
                    console.log(res);
                }).catch(function (err) {
                    console.log('Duplicate: ' + acc_arr[0] + ' - ' + acc_arr[1] + ' - ' + acc_arr[2]);
                });
            }
        }
        data.forEach(function(street){
            console.log(street.name)
        })
    }
    convertData(water_bill) {
        this.convertAmounts(water_bill);
        this.convertDates(water_bill);
        this.calcDiff(water_bill);
    }
    convertDates(water_bill) {
        var fields = ['current_read_date', 'current_bill_date', 'penalty_date', 'previous_read_date', 'last_pay_date'];
        fields.forEach((field) => {
            water_bill[field] = new Date(water_bill[field]);
        });
    }
    convertAmounts(water_bill) {
        var fields = ["current_bill_amount", "previous_balance", "current_balance", "last_pay_amount"];
        fields.forEach((field) => {
            var val = water_bill[field].replace('$', '').replace(',', '');
            if (val == '.00') {
                val = 0;
            }
            water_bill[field] = parseFloat(val);
        });
    }
    calcDiff(water_bill) {
        water_bill.balance_diff = parseFloat((water_bill.current_balance - water_bill.previous_balance).toFixed(2));
    }
}

module.exports = WaterBill