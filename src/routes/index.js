const passport = require('passport');
const { Router } = require('express');
const router = Router();

//Tratando de traer datos de la base
// const mongoose = require('mongoose');
// var url = 'mongodb://mongo/escuela';
//require('../database')
//Termona tratando de traer datos de la base
const cursos = require('../models/compracursos');
const subscripciones = require('../models/suscrip');
const contactos = require('../models/contact');
const { serializeUser } = require('passport');

router.get('/', (req, res, next) => {
    res.render('signin');
  });

  
router.get('/signup', (req, res, next) => {
  res.render('signup');
});

router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/cursos',
  failureRedirect: '/signin',
  failureFlash: true
})); 

router.get('/signin', (req, res, next) => {
  res.render('signin');
});


router.post('/signin', passport.authenticate('local-signin', {
  successRedirect: '/cursos',
  failureRedirect: '/signin',
  failureFlash: true
}));



router.get('/profile',isAuthenticated, async (req, res, next) => {
    //Tratando de traer los datos de la base 

  const cursosUsu = await cursos.find();
  
  //Fin tratando de traer los datos de la base
 

   res.render('profile',{
     //cursosUsuario: [cursosUsuario]
     'cursosUsuario': cursosUsu
   });
});


router.get('/cursos',isAuthenticated, (req, res, next) => {
  res.render('cursos');// era res.render('cursos');
});

//era reuter.post
router.all('/cursos', async (req, res, next)=>{
  console.log(req.body);
  

  let curso = new cursos();
  curso.email = req.body.email
  curso.paymethod = req.body.paymethod
  curso.nombre = req.body.nombre
  curso.costo = req.body.costo

  curso.save((err, cursoStored)=>{
      if (err) res.status(500).send({message: 'Error al guardar'})
  })
 
    // const cursosUsuario = await cursos.find();
    // res.render('profile',{
    //   cursosUsuario: [cursosUsuario]
    // });

    res.redirect(301, '/profile');

    //res.send({redirect: '/profile'});

});

router.get('/contacto',isAuthenticated, (req, res, next) => {
  res.render('contacto'); 
});

router.all('/contacto', async (req, res, next)=>{
  console.log(req.body);
  

  let sub = new subscripciones();
  sub.email2 = req.body.email2
  sub.subs = req.body.subs

  sub.save((err, cursoStored)=>{
      if (err) res.status(500).send({message: 'Error al guardar'})
  })
 

  let mnsj = new contactos();
 
  mnsj.email3 = req.body.email3
  mnsj.comentario = req.body.comentario

  mnsj.save((err, cursoStored)=>{
      if (err) res.status(500).send({message: 'Error al guardar'})
  })
    // const cursosUsuario = await cursos.find();
    // res.render('profile',{
    //   cursosUsuario: [cursosUsuario]
    // });

    res.redirect(301, '/profile');

    //res.send({redirect: '/profile'});

});

router.get('/profesores',isAuthenticated, (req, res, next) => {
  res.render('profesores'); 
});

router.get('/cursoUnlockedCpp',isAuthenticated, (req, res, next) => {
  res.render('cursoUnlockedCpp'); 
});


router.get('/cursoUnlockedJavascript',isAuthenticated, (req, res, next) => {
  res.render('cursoUnlockedJavascript');
});


router.get('/cursoUnlockedMEAN',isAuthenticated, (req, res, next) => {
  res.render('cursoUnlockedMEAN');
});

router.get('/cursoUnlockedPython',isAuthenticated, (req, res, next) => {
  res.render('cursoUnlockedPython');
});

router.get('/cursoCpp',isAuthenticated, (req, res, next) => {
  res.render('cursoCpp'); 
});

router.get('/cursoJavascript',isAuthenticated, (req, res, next) => {
  res.render('cursoJavascript'); 
});

router.get('/cursoMEAN',isAuthenticated, (req, res, next) => {
  res.render('cursoMEAN'); 
});

router.get('/cursoPython',isAuthenticated, (req, res, next) => {
  res.render('cursoPython'); 
});

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