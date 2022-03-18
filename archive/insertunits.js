var knex_config = require(__dirname + '\\config\\knex.json')
var Promise = require("bluebird");
var knex = require('knex')(knex_config);
var _ = require('lodash')

var properties = require(__dirname + '\\units.json')
var props = [];
properties.forEach(function(prop) {
    props.push({
        property: prop.property
    })
})
knex('property').insert(props).then((val)=> {
    console.log(val);
    knex.destroy()
}).catch((err)=> {
    console.log(err);
    knex.destroy()
})
