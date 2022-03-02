const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const bodyParser = require('body-parser'); //Informarme
const flash = require('connect-flash'); //Informarme
const session = require('express-session'); //Informarme
const cookieParser = require('cookie-parser'); //Informarme
const expressValidator = require('express-validator');
const passport = require('./config/passport');
const router = require('./routes');

//Configuracion y modelos BD
const db = require('./config/db');
const { pass } = require('./config/emails');
    require('./models/Usuarios');
    require('./models/Categorias');
    require('./models/Comentarios');
    require('./models/Grupos');
    require('./models/Meeti');
    db.sync().then(() => console.log('DB Conectada')).catch((error) => console.log(error));


//Variables de desarollo
require('dotenv').config({path: 'variables.env'});

//Aplicacion Principal
const app = express();

//Habilitar bodyparser leer formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Express validator validacion con bastante funciones para ser utilizadas
app.use(expressValidator());
//Habilitar EJS como template engine
app.use(expressLayouts);
app.set('view engine', 'ejs');

//Ubicacion vistas
app.set('views', path.join(__dirname, './views'));

//Archivos estaticos
app.use(express.static('public'));

//Habilitar cookieparser
app.use(cookieParser());

//Crear la session
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false
}));

//Inicializar passport
app.use(passport.initialize());
app.use(passport.session());

//Agrega flash MSJ
app.use(flash());

//Middleware usuario logueado, flash messages, fecha acutal
app.use((req,res, next) => {
    res.locals.usuario = {...req.user} || null;
    res.locals.mensajes = req.flash();
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();
    next();
})

//routing
app.use('/', router());

//Variables del port y host
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 5000;

//Agrega el puerto
app.listen(port, host, () => {
    console.log('Servidor corriendo')
})