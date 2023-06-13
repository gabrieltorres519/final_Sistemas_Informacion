const passport = require('passport');
const { Router } = require('express');
const router = Router();
const bcrypt = require('bcryptjs');
const { uploadImage, deleteImage } = require("../libs/cloudinary.js");
const fs = require('fs-extra');



const libros = require('../models/libros');
const users = require('../models/user')
const proveedores = require('../models/proveedores') 
const compras = require('../models/compras')
const ventas = require('../models/ventas')
const { serializeUser } = require('passport');
 
router.get('/', (req, res, next) => {
    res.render('signin');
  });
  
router.get('/signup', (req, res, next) => {
  res.render('signup');
});

router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/perfil',
  failureRedirect: '/signin',
  failureFlash: true
})); 

router.get('/adminSecret', (req, res, next) => {
  res.render('signupAdminSecret');
});

router.post('/AdminSecret', passport.authenticate('local-signup', {
  successRedirect: '/perfil',
  failureRedirect: '/signin',
  failureFlash: true
})); 

router.get('/signin', (req, res, next) => {
  res.render('signin');
});


router.post('/signin', passport.authenticate('local-signin', {
  successRedirect: '/perfil',
  failureRedirect: '/signin',
  failureFlash: true
}));

router.get('/perfil',isAuthenticated,  (req, res, next) => {
  res.render('dashboard');
});



// Sección Ventas a Clientes_________________________________________________________________________________________________________

router.get('/nuevaCompra/:id',isAuthenticated, async(req,res,next)=>{
  const specificBook = await libros.findById(req.params.id).lean()

  res.render('comprarLibro', {
    'libroData': specificBook
  })
})

router.post('/nuevaCompra',isAuthenticated, async(req,res,next)=>{
  console.log('Se muestra el objeto que se envía');
  console.log(req.body);
  const encontrado = await libros.find({titulo: req.body.titulo});



  let venta = new ventas();
  venta.correo = req.body.correo;
  venta.titulo = req.body.titulo;
  venta.autor = req.body.autor;
  venta.edicion = req.body.edicion;
  venta.cantidad = req.body.cantidad;
  venta.tarjeta = req.body.tarjeta;
  venta.direccion = req.body.direccion;

  console.log('1111_________________________________________________________________________________________________')

  console.log(encontrado)
 
  const stock_Actual = encontrado[0].cantidad_stock;
  let cantidad_actualizada = parseInt(stock_Actual, 10) - parseInt(req.body.cantidad, 10);
  await libros.updateOne({titulo: req.body.titulo}, {cantidad_stock: cantidad_actualizada});
  console.log(stock_Actual)
  console.log('2222_________________________________________________________________________________________________')

  venta.save((err, cursoStored)=>{
    if (err) res.status(500).send({message: 'Error al guardar'})
  })

  res.redirect(301, '/misLibros');

})

router.get('/misLibros',isAuthenticated, async(req,res,next)=>{
  const misLibros =  await ventas.find();

  res.render('librosComprados',{
    //cursosUsuario: [cursosUsuario]
    'libros': misLibros
  });
})

router.get('/deleteCompra/:id_libro_compra/:nombre_libro/:cantidad_comprada',isAuthenticated, async(req,res)=>{
  const {id_libro_compra, nombre_libro, cantidad_comprada} = req.params
  const encontrado = await libros.find({titulo: nombre_libro});

  console.log('1111_________________________________________________________________________________________________')

  console.log(encontrado)
 
  const stock_Actual = encontrado[0].cantidad_stock;
  let cantidad_actualizada = parseInt(stock_Actual, 10) + parseInt(cantidad_comprada, 10);
  await libros.updateOne({titulo: nombre_libro}, {cantidad_stock: cantidad_actualizada});
  console.log('Cantidad_Comprada:' +cantidad_comprada)
  console.log('Stock actualizado: '+stock_Actual)
  console.log('2222_________________________________________________________________________________________________')

  await ventas.findByIdAndDelete(id_libro_compra,req.body)


  res.redirect('/misLibros')
});

// Termina sección Ventas a Clientes______________________________________________________________________________________



// Sección Productos_________________________________________________________________________________________________________

router.get('/gestProd',isAuthenticated, async (req, res, next) => {
  const mislibros =  await libros.find();

  res.render('gestionProductos',{
    //cursosUsuario: [cursosUsuario]
    'books': mislibros
  });
}); 

router.get('/gestComp',isAuthenticated, async(req,res,next)=>{
  const miscompras =  await compras.find();

  res.render('gestionCompras',{
    //cursosUsuario: [cursosUsuario]
    'compras': miscompras
  });
})

router.get('/nuevoProduc',isAuthenticated, async(req, res, next) => {
  const provs =  await proveedores.find();
  res.render('nuevoProducto',{
    //cursosUsuario: [cursosUsuario]
    'proveedores': provs
  });

}); 

router.post('/nuevoProduc', async (req, res, next) => {
  console.log('Se muestra el objeto que se envía');
  console.log(req.body);

  const encontrado = await libros.find({titulo: req.body.titulo, autor: req.body.autor, edicion: req.body.edicion});
  const length_flag = encontrado.length;
  console.log('_________________________________________________________________________________________________')
  console.log(length_flag);
  console.log('_________________________________________________________________________________________________')

  //Guardado del archivo recibido desde el formulario en el sistema de ficheros__________________________________________
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'No se proporcionó un archivo' });
    }else{
      const result = await uploadImage(req.files.image.tempFilePath); 
      await fs.remove(req.files.image.tempFilePath);
      image = {
            url: result.secure_url,
            public_id: result.public_id
      };
      console.log('________________________________________________________________________')
      console.log('Cloudinary responde que la imagen es: '+ result + ' y extraemos convenientemente los parámetros para tener: ' + image)
      console.log('________________________________________________________________________')
    }

    //const image = req.files.image;
    // Hacer algo con el archivo (guardarlo, procesarlo, etc.)
    // console.log('El archivo es: '+ image)
    // console.log('Archivo añadido')

  //__________________________________________

  let lib = new libros();


  if(length_flag == '0'){
    lib.titulo = req.body.titulo;
    lib.autor = req.body.autor;
    lib.genero = req.body.genero;
    lib.edicion = req.body.edicion;
    lib.precio_venta = req.body.precio_venta;
    lib.image = image;
    lib.cantidad_stock = req.body.unidades_compra;
    lib.save((err, cursoStored) => {
      if (err) res.status(500).send({message: 'Error al guardar'});
    });
  }else{
    const stock_Actual = encontrado[0].cantidad_stock;
    let cantidad_actualizada = parseInt(stock_Actual, 10) + parseInt(req.body.unidades_compra, 10);
    await libros.updateOne({titulo: req.body.titulo}, {cantidad_stock: cantidad_actualizada});
    lib.cantidad_stock = cantidad_actualizada;
  }


  let comprado = new compras();

  comprado.proveedor = req.body.proveedor;
  comprado.titulo = req.body.titulo;
  comprado.autor = req.body.autor;
  comprado.edicion = req.body.edicion;
  comprado.precio_unitario = req.body.precio_compra_unit;
  comprado.unidades_compra = req.body.unidades_compra;

  comprado.save((err, cursoStored) => {
    if (err) res.status(500).send({message: 'Error al guardar'});
  });
  
  // const librosResult = await libros.find();

  res.redirect('/gestProd');
});

router.get("/editProduct/:id",isAuthenticated,async(req,res)=>{
  //console.log(req.params.id)
  const specificBook = await libros.findById(req.params.id).lean()
  const provs =  await proveedores.find();
 
 // res.render("edit");
  res.render("editarProducto",{
    specificBook,
    'proveedores': provs
  });
});
 
router.post("/editProduct/:id",isAuthenticated,async(req,res)=>{
  const {id} = req.params
  const theBook = await libros.findOne({_id: id})
   
  
  //Guardado del archivo recibido desde el formulario en el sistema de ficheros__________________________________________
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'No se proporcionó un archivo' });
    }else{
      const result = await uploadImage(req.files.image.tempFilePath); 
      await fs.remove(req.files.image.tempFilePath);
      image = {
            url: result.secure_url,
            public_id: result.public_id
      };
      console.log('________________________________________________________________________')
      console.log('Cloudinary responde que la imagen es: '+ result + ' y extraemos convenientemente los parámetros para tener: ' + image)
      console.log('________________________________________________________________________')
    }



  await libros.findByIdAndUpdate(id,{ 
    titulo: req.body.titulo,
    autor: req.body.autor,
    genero: req.body.genero,
    edicion: req.body.edicion,
    precio_venta: req.body.precio_venta,
    cantidad_stock: req.body.unidades_compra,
    image: image
  })

  console.log(req.body);
  const result = await deleteImage(theBook.image.public_id); 
  // res.send('Cambio recibido');
  res.redirect('/gestProd')
});


router.get('/deleteProduct/:id',isAuthenticated,async(req,res)=>{
  const {id} = req.params
  const theBook = await libros.findOne({_id: id})
  const result = await deleteImage(theBook.image.public_id); 
  await libros.findByIdAndDelete(id,req.body)
  console.log(result)
    

  res.redirect('/gestProd')
});
// Termina sección Productos______________________________________________________________________________________


// Sección clientes_________________________________________________________________________________________________________
router.get('/clientes',isAuthenticated, async (req,res,next)=>{
  const userData = await users.find() 

  // 'Antes de eliminar password'
  userData.forEach(user => {
    user.password = 'For security sake the password is never sent from the backend'
  });
  // 'Después de eliminar password'

  res.render('clientes',{ 
    //cursosUsuario: [cursosUsuario]
    'usuarios': userData
  });
})

router.get('/signup_priv',isAuthenticated, (req, res, next) => {
  res.render('signup_admin');
});

router.post('/signup_priv',isAuthenticated, (req, res, next) => {
  console.log('Se muestra el objeto que se envía');
  console.log(req.body);

  let user = new users();
  user.name = req.body.name;
  user.email = req.body.email;
  user.phone = req.body.phone;
  user.profile = req.body.profile;

  // Obtener el campo de contraseña del cuerpo de la solicitud
  const password = req.body.password;
  console.log('Comienza encriptado');

  // Generar un hash de la contraseña
  bcrypt.genSalt(10, function(err, salt) {
    if (err) {
      console.log('Error al generar el salt:', err);
      res.status(500).send('Error interno del servidor');
      return;
    }

    bcrypt.hash(password, salt, function(err, hash) {
      if (err) {
        console.log('Error al generar el hash:', err);
        res.status(500).send('Error interno del servidor');
        return;
      }

      // Guardar el hash de la contraseña en el usuario
      user.password = hash;
      console.log(hash);
      console.log('Termina encriptado');

      // Guardar el usuario en la base de datos
      user.save((err, userStored) => {
        if (err) {
          console.log('Error al guardar el usuario:', err);
          res.status(500).send('Error al guardar el usuario');
          return;
        }

        // Redireccionar o enviar una respuesta exitosa
        res.redirect(301, '/clientes');
      });
    });
  });
});

router.get("/edit/:id",isAuthenticated,async(req,res)=>{
  //console.log(req.params.id)
const specificUser = await users.findById(req.params.id).lean()
 
 // res.render("edit");
  res.render("editarUsuario",{specificUser});
});

router.post("/edit/:id",isAuthenticated,async(req,res)=>{
  const {id} = req.params
  await users.findByIdAndUpdate(id,req.body)
  console.log(req.body);
  // res.send('Cambio recibido');
  res.redirect('/clientes')
});

router.get('/delete/:id',isAuthenticated,async(req,res)=>{
  const {id} = req.params
  await users.findByIdAndDelete(id,req.body)
  // console.log(req.body);
  // res.send('Cambio recibido');
  res.redirect('/clientes')
});
// Termina sección clientes______________________________________________________________________________________





// Sección proveedores___________________________________________________________________________________________
router.get('/proveedores',isAuthenticated, async (req,res,next)=>{
  const provData = await proveedores.find() 

  res.render('proveedores',{ 
    //cursosUsuario: [cursosUsuario]
    'proveedores': provData
  });
})

router.get('/nuevoProv',isAuthenticated, (req, res, next) => {
  res.render('nuevoProveedor');
}); 

router.post('/nuevoProv',isAuthenticated, (req, res, next) => {
  console.log('Se muestra el objeto que se envía');
  console.log(req.body);

  let prov = new proveedores();
  prov.nombre = req.body.nombre;
  prov.direccion = req.body.direccion;
  prov.telefono = req.body.telefono;
  prov.correo_electronico = req.body.correo_electronico;
 
  prov.save((err, cursoStored)=>{
    if (err) res.status(500).send({message: 'Error al guardar'})
  })

  res.redirect(301, '/proveedores');

});

router.get("/editProveedor/:id",isAuthenticated,async(req,res)=>{
  //console.log(req.params.id)
const specificProv = await proveedores.findById(req.params.id).lean()
 
 // res.render("edit");
  res.render("editarProveedor",{specificProv});
});

router.post("/editProveedor/:id",isAuthenticated,async(req,res)=>{
  const {id} = req.params
  await proveedores.findByIdAndUpdate(id,req.body)
  console.log(req.body);
  // res.send('Cambio recibido');
  res.redirect('/proveedores')
});

router.get('/deleteProveedor/:id',isAuthenticated,async(req,res)=>{
  const {id} = req.params
  await proveedores.findByIdAndDelete(id,req.body)
  // console.log(req.body);
  // res.send('Cambio recibido');
  res.redirect('/proveedores')
});

// termina sección Proveedores____________________________________________________________________________________


router.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/signin');
});


function isAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }

  res.redirect('/signin')
}


module.exports = router;