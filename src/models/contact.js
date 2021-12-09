const mongoose = require('mongoose');
const { Schema } = mongoose;

const contactoSchema = new Schema({
    email3: String,
    comentario: String
});


module.exports =  mongoose.model('contactos',contactoSchema);