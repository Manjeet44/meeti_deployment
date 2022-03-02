const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/emails');
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const uuid = require('uuid').v4;

const configuracionMulter = {
    limits: {fileSize: 100000},
    storage: fileStorage = multer.diskStorage({
        destination: (req, res, next) => {
            next(null, __dirname+'/../public/uploads/perfiles/');
        },
        filename: (req, file, next) => {
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, next) {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            next(null, true);
        } else {
            next(new Error('Formato no valido'), false);
        }
    }

}
const upload = multer(configuracionMulter).single('imagen');

//Subir imagen en el servidor
exports.subirImagen = async (req, res, next) => {
    upload(req, res, function(error){
            if(error) {
                if(error instanceof multer.MulterError){
                    if(error.code === 'LIMIT_FILE_SIZE') {
                        req.flash('error', 'El Archivo es muy grande')
                    } else {
                        req.flash('error', error.message)
                    }
                } else if(error.hasOwnProperty('message')) {
                    req.flash('error', error.message);
                }
                res.redirect('back');
                return;
            } else {
                next();
            }
    })
}

exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta'
    });
}

exports.crearNuevoUsuario = async (req, res) => {
    const usuario = req.body;

    req.checkBody('confirmar', 'El password confirmado no puede ir vacio').notEmpty();
    req.checkBody('confirmar', 'El password es diferente').equals(req.body.password);

    const erroresExpress = req.validationErrors();

    try {
        await Usuarios.create(usuario);

        //Url de confirmacion
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`
        //Enviar email de confirmacion
        await enviarEmail.enviarEmail({
            usuario,
            url,
            subject: 'Confirma tu cuenta de Meeti',
            archivo: 'confirmar-cuenta'
        })

        //Flash msj y redireccionar
        req.flash('exito', 'Te hemos enviado un email, confirma tu cuenta');
        res.redirect('/iniciar-sesion');
    } catch (error) {
        const erroresSequelize = error.errors.map(err => err.message);
        const errExp = erroresExpress.errors.map(err => err.msg);

        //Unirlos
        const listaErrores = [...erroresSequelize, ...errExp];
        req.flash('error', listaErrores);
        res.redirect('/crear-cuenta');
    }
    
}

//Formulario inciar sesion
exports.formIniciarSesion = async (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesion'
    });
}

//Confirma la suscripcion del usuario
exports.confirmarCuenta = async (req, res, next) => {
    //Verificar que el usuario existe
    const usuario = await Usuarios.findOne({where: {email: req.params.correo}})
    //Redireccionar
    if(!usuario) {
        req.flash('error', 'No existe esa cuenta');
        res.redirect('/crear-cuenta');
        return next();
    }
    //Confirmar suscripcion
    usuario.activo = 1;
    await usuario.save();

    req.flash('exito', 'La cuenta se ha confirmado, ya puedes iniciar sesion');
    res.redirect('/iniciar-sesion');
}

//Muestra el fomrulario para editar el perfil
exports.formEditarPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);
    
    res.render('editar-perfil', {
        nombrePagina: `Editar perfil: ${usuario.nombre}`,
        usuario
    })
}

//Almacena en la BD los cambios del perfil
exports.editarPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    req.sanitizeBody('nombre');
    req.sanitizeBody('email');
    
    //Leer datos del form
    const {nombre, descripcion, email} = req.body;

    usuario.nombre = nombre;
    usuario.descripcion = descripcion;
    usuario.email = email;

    //Guardar en la BD
    await usuario.save();
    req.flash('exito', 'Se modifico correctamente');
    res.redirect('/administracion');

}

//Formulario para cambiar password
exports.formCambiarPassword = (req, res) => {
    res.render('cambiar-password', {
        nombrePagina: 'Cambiar Password'
    })
}

//Revisa si el password anterior es correcto para cambiar a un nuevo pass
exports.cambiarPassword = async (req, res, next) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    //Verificar que el password actual es correcto
    if(!usuario.validarPassword(req.body.anterior)) {
        req.flash('error', 'El password actual es incorrecto');
        res.redirect('/administracion');
        return next();
    }
    //Si el password es correcto, hashear el nuevo
    const hash = usuario.hashPassword(req.body.nuevo);
    console.log(hash);
    //Asignar el password al usuario
    usuario.password = hash;
    //Guardar en la BD
    await usuario.save();
    //Redireccionar
    req.logout();
    req.flash('exito', 'Password modificado Correctamente, vuelve a iniciar sesion');
    res.redirect('/iniciar-sesion');
}

//Formulario subir imagen perfil
exports.formSubirImagenPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('imagen-perfil', {
        nombrePagina: 'Subir imagn Perfil',
        usuario
    })
}

//Guarda la imagen nuevoa, elimina la anterior y guarda el registro en la BD
exports.guardarImagenPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    //Si hay imagen anterior y nueva, significa que vamos a borrar la anterior
    if(req.file && usuario.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/perfiles/${usuario.imagen}`;
        fs.unlink(imagenAnteriorPath, (error) => {
            if(error) {
                console.log(error);
            }
            return;
        })
    }
    //Si hay una imagen nueva, la guardamos
    if(req.file) {
        usuario.imagen = req.file.filename;
    }

    //Almacenar en la BD
    await usuario.save();
    req.flash('exito', 'Cambios Almacenados Correctamente');
    res.redirect('/administracion');
}