const mongoose = require('mongoose');
const { Schema } = mongoose;

const proveedoresSchema = new Schema({
    nombre: String,
    direccion: String,
    telefono: Number,
    correo_electronico: String
  });


module.exports =  mongoose.model('proveedores',proveedoresSchema);