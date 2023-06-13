const mongoose = require('mongoose');
const { Schema } = mongoose;

const ventasSchema = new Schema({
  correo: String,
  titulo: String,
  autor: String,
  edicion: String,
  cantidad: Number,
  tarjeta: String,
  direccion: String
});

module.exports = mongoose.model('ventas', ventasSchema);

