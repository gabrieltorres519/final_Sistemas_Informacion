const mongoose = require('mongoose');
const { Schema } = mongoose;

const subscripSchema = new Schema({
    email2: String,
    subs: {type: String, enum: ['Semanal','Mensual','Diaria']},
});


module.exports =  mongoose.model('subscripciones',subscripSchema);
