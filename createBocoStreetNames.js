var knex_config = require(__dirname + '\\config\\knex.json')
var Promise = require("bluebird");
var knex = require('knex')(knex_config);
var _ = require ('lodash');
knex.from('boco_street_name').then((result) => {
    console.log(result)
    var arr = [];
    result.forEach(function(name) {
        arr.push(name.streetname);
    })
    console.log(arr)
    var uniq = _.uniq(arr)
    var arr2 = [];
    uniq.forEach(function(name) {
        arr2.push({name:name});
    })
    console.log(uniq)
    arr2.forEach(function(val) {
        knex('unique_street_name').insert(val).then(function(res) {
            console.log(res)
        }).catch(function(val) {
            console.log('whatev')
        })
    })
    // knex('unique_street_name').insert(arr2).then((result)=>{
    //         console.log(result)
    //         knex.destroy()
    //     }).catch(function(err) {
    //         console.log(err)
    //     })
    // result.forEach((prop) => {
    //     // console.log(prop.PropertyAddress)
    //     var arr = re.exec(prop.PropertyAddress);
    //     try {
    //         if(arr && arr[2]) {
    //             street_arr.push(arr[2] + ' ' + arr[3].replace(' U#',''))
    //         } else if(arr) {
    //             street_arr.push(arr[3])
    //         }
    //     } catch(error) {
    //         console.log(prop.PropertyAddress)
    //     }

    // })
    // var unique_street = street_arr.filter(onlyUnique);
    // // console.log(unique_street)
    // u_street_objs = [];
    // unique_street.forEach((val) => {
    //     u_street_objs.push({name: val})
    // })
    // console.log(u_street_objs)
    // knex('unique_street_name').insert(u_street_objs).then((result)=>{
    //     console.log(result)
    //     knex.destroy()
    // })
})
// Promise.all(arr).then((lol) => {
//     knex.destroy()
// })

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
  
  // usage example:
