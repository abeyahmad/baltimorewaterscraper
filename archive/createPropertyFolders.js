var fs = require('fs');
var properties = require(__dirname+'\\data\\properties.json')
properties.forEach((prop)=>fs.mkdirSync(__dirname+'\\bill_snapshots\\'+prop))
