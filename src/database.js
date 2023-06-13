const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/final_sistemas')
    .then(db => console.log('BASE DE DATOS CONECTADA', db.connection.host))
    .catch(err => console.error(err));