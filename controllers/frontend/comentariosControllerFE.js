const Comentarios = require('../../models/Comentarios');
const Meeti = require('../../models/Meeti');


exports.agregarComentario = async (req, res, next) => {
    //Obtener Comentario
    const {comentario} = req.body;

    //Crear comentario en la BD
    await Comentarios.create({
        mensaje: comentario,
        usuarioId: req.user.id,
        meetiId: req.params.id
    })

    //Redireccionar a la mimsa pagina
    res.redirect('back');
    next();
}

//Elimina un comentario de la BD
exports.eliminarComentario = async (req, res, next) => {
    //Tomar el id del comentario
    const {comentarioId} = req.body;
    //Consultar el comentario
    const comentario = await Comentarios.findOne({where: {id: comentarioId}});

    //Verificar si existe elcomentario
    if(!comentario) {
        res.status(404).send('Accion no valida');
        return next();
    }

    //Consultar el meeti del comentario
    const meeti = await Meeti.findOne({where: {id: comentario.meetiId}});

    //verificar que quien lo borra sea el creador
    if(comentario.usuarioId === req.user.id || meeti.usuarioId === req.user.id) {
        await Comentarios.destroy({where: {
            id: comentario.id
        }});
        res.status(200).send('Eliminado Correctamente');
        return next();
    } else {
        res.status(403).send('Accion no valida');
        return next();
    }

}