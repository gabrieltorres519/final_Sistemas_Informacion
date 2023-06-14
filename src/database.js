const mongoose = require('mongoose');

// mongoose.connect('mongodb://localhost/final_sistemas')
mongoose.connect('mongodb+srv://gatorresmendoza:7tphDXuZhi6D1BGy@cluster0.7g1ama0.mongodb.net/?retryWrites=true&w=majority')
    .then(db => console.log('BASE DE DATOS CONECTADA', db.connection.host))
    .catch(err => console.error(err));