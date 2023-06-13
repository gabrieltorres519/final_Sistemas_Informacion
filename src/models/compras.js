const mongoose = require('mongoose');
const {Schema} = mongoose;

const comprasSchema = new Schema({
  proveedor: String,
  titulo: String,
  autor: String,
  edicion: String,
  precio_unitario: Number,
  unidades_compra: Number
});

module.exports = mongoose.model('compras', comprasSchema);

