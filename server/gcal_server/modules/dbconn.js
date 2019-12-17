const mongoose = require("mongoose");
const gcal_model = require("./gcal.model");
//const config = require("../config.json");

var address = 'mongodb://mongo:27017/gcal_cache' //could be swapped for config.json value

const connectDb = () => {
    return mongoose.connect(address, {useUnifiedTopology:true, useNewUrlParser:true});
};
module.exports = connectDb;