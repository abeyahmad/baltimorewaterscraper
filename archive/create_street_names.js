var knex_config = require(__dirname + '\\config\\knex.json')
var Promise = require("bluebird");
var knex = require('knex')(knex_config);

knex.from('property').where('PropertyAddress','NOT LIKE','% -%').then((result) => {
    var re = /^(\d+) ?([A-Za-z](?= ))? (.*?) ([^ ]+?) ?((?<= )APT)? ?((?<= )\d*)?$/
    // console.log(result);
    var street_arr = []
    result.forEach((prop) => {
        // console.log(prop.PropertyAddress)
        var arr = re.exec(prop.PropertyAddress);
        try {
            if(arr && arr[2]) {
                street_arr.push(arr[2] + ' ' + arr[3].replace(' U#',''))
            } else if(arr) {
                street_arr.push(arr[3])
            }
        } catch(error) {
            console.log(prop.PropertyAddress)
        }

    })
    var unique_street = street_arr.filter(onlyUnique);
    // console.log(unique_street)
    u_street_objs = [];
    unique_street.forEach((val) => {
        u_street_objs.push({name: val})
    })
    console.log(u_street_objs)
    knex('unique_street_name').insert(u_street_objs).then((result)=>{
        console.log(result)
        knex.destroy()
    })
})
// Promise.all(arr).then((lol) => {
//     knex.destroy()
// })

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
  
  // usage example:
