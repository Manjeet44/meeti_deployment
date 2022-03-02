const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const uuid = require('uuid').v4;

const configuracionMulter = {
    limits: {fileSize: 100000},
    storage: fileStorage = multer.diskStorage({
        destination: (req, res, next) => {
            next(null, __dirname+'/../public/uploads/grupos/');
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

exports.formNuevoGrupo = async (req, res) => {
    const categorias = await Categorias.findAll();

    res.render('nuevo-grupo', {
        nombrePagina: 'Crea un nuevo grupo',
        categorias
    })
}

//Almacena los grupos en la BD
exports.crearGrupo = async (req, res) => {
    
    //TODO SANITIZAR
    req.sanitizeBody('nombre');
    req.sanitizeBody('url');
    const grupo = req.body;
    
    //Almacena el usuario autenticado como el creador del grupo
    grupo.usuarioId = req.user.id;

    //Leer la imagen
    if(req.file){
        grupo.imagen = req.file.filename;
    } 

    grupo.id = uuid();

    try {   
        //Almacenar en la BD
        await Grupos.create(grupo);
        req.flash('exito', 'Grupo creado correctamente');
        res.redirect('/administracion');
    } catch (error) {
        const erroresSequelize = error.errors.map(err => err.message);
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-grupo')
    }
}


exports.formEditarGrupo = async (req, res) => {
    const consultas = [];
    consultas.push(Grupos.findByPk(req.params.grupoId));
    consultas.push(Categorias.findAll());

    //Promise con await
    const [grupo, categorias] = await Promise.all(consultas);
    res.render('editar-grupo', {
        nombrePagina: `Editar Grupo: ${grupo.nombre}`,
        grupo,
        categorias

    })
}

//Guarda los cambios en la BD
exports.editarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where: {id : req.params.grupoId, usuarioId : req.user.id}});

    if(!grupo) {
        req.flash('error', 'Operacion no valida');
        res.redirect('/administracion');
        return next();
    }
    const {nombre, descripcion, categoriaId, url} = req.body;

    //Reescribir objeto
    grupo.nombre = nombre;
    grupo.descripcion = descripcion;
    grupo.categoriaId = categoriaId;
    grupo.url = url;

    await grupo.save();
    req.flash('exito', 'Cambios Almacenados Correctamente');
    res.redirect('/administracion');
}

//Formulario editar imagen del grupo
exports.formEditarImagen = async (req, res) => {
    const grupo = await Grupos.findOne({ where: {id : req.params.grupoId, usuarioId : req.user.id}});

    res.render('imagen-grupo', {
        nombrePagina: `Editar Imagen Grupo: ${grupo.nombre}`,
        grupo
    })
}

//modifica la imagen en la BD y elimina la anterior
exports.editarImagen = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where: {id : req.params.grupoId, usuarioId : req.user.id}});
    if(!grupo) {
        req.flash('error', 'Operacion no Valida');
        res.redirect('/iniciar-sesion');
        return next();
    }
    //Verificar que el archovo sea nuevo
    //if(req.file){}
    //Revisa que exista un archivo anterior
    //if(grupo.imagen) {}
    //Si hay imagen anterior y nueva, significa que vamos a borrar la anterior
    if(req.file && grupo.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;
        fs.unlink(imagenAnteriorPath, (error) => {
            if(error) {
                console.log(error);
            }
            return;
        })
    }
    if(req.file) {
        grupo.imagen = req.file.filename;
    }
    await grupo.save();
    req.flash('exito', 'Cambios Almacenados Correctamente');
    res.redirect('/administracion');
}

//Muestra el fomrulario para eliminar un grupo
exports.formEliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({where : {id: req.params.grupoId, usuarioId: req.user.id}});
    if(!grupo) {
        req.flash('error', 'Operacion no valida');
        res.redirect('/administracion');
        return next();
    }

    res.render('eliminar-grupo', {
        nombrePagina: `Eliminar Grupo :  ${grupo.nombre}`
    });

}

//Elimina el grupo y la imagen
exports.eliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({where : {id: req.params.grupoId, usuarioId: req.user.id}});

    //Si hay una imagen, eliminarla
    if(grupo.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;
        fs.unlink(imagenAnteriorPath, (error) => {
            if(error) {
                console.log(error);
            }
            return;
        })
    }
    //Eliminar grupo
    await Grupos.destroy({
        where: {
            id: req.params.grupoId
        }
    });

    //Redireccionar al usuario
    req.flash('exito', 'Grupo Eliminado');
    res.redirect('/administracion');
}