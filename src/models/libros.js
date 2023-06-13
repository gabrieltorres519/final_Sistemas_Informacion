const mongoose = require('mongoose');
const { Schema } = mongoose;

const libroSchema = new Schema({
  titulo: String,
  autor: String,
  genero: String,
  edicion: String,
  precio_venta: Number,
  cantidad_stock: Number,
  image: {
    url: String,
    public_id: String
  }
});

module.exports = mongoose.model('libros', libroSchema);


