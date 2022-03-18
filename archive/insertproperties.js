var knex_config = require(__dirname + '\\config\\knex.json')
var Promise = require("bluebird");
var knex = require('knex')(knex_config);
var _ = require('lodash')

var properties = require(__dirname + '\\properties.json')
properties.forEach((prop)=>delete prop.dimension)
knex('property').insert(properties).then((val)=> {
    console.log(val);
    knex.destroy()
}).catch((err)=> {
    console.log(err);
    knex.destroy()
})
