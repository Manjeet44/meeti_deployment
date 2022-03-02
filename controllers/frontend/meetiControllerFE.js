const Meeti = require('../../models/Meeti');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');
const Categorias = require('../../models/Categorias');
const Comentarios = require('../../models/Comentarios');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.mostrarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({
        where: {
            slug: req.params.slug
        },
        include: [
            {
                model: Grupos
            },
            {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    });

    //Si no existe
    if(!meeti){
        res.redirect('/');
    }

    //Consultar por meeti's cercanos
    const ubicacion = Sequelize.literal(`ST_GeomFromText('POINT( ${meeti.ubicacion.coordinates[0]} ${meeti.ubicacion.coordinates[1]})')`);

    //ST_DISTANCE_Sphere = Retorna una linea en metros
    const distancia = Sequelize.fn('ST_DistanceSphere', Sequelize.col('ubicacion'), ubicacion);

    //Encontrar meetis cercanos
    const cercanos = await Meeti.findAll({
        order: distancia, //Del mas cercano a lejano
        where: Sequelize.where(distancia, {[Op.lte] : 2000}), //Cerca de 2km
        limit: 3, // 3 mas cercanos
        offset: 1,
        include: [
            {
                model: Grupos
            },
            {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    });

    //Consultar despues de verificar que existe el meeti
    const comentarios = await Comentarios.findAll({
        where: { meetiId: meeti.id}, include: [{model: Usuarios, attributes: ['id', 'nombre', 'imagen']}]
    });


    //Pasar el resultado hacia la vista
    res.render('mostrar-meeti', {
        nombrePagina: meeti.titulo,
        meeti,
        comentarios,
        cercanos,
        moment
    })
}

//Confirmar asistencia
exports.confirmarAsistencia = async (req, res) => {
    
    const {accion} = req.body;

    if(accion === 'confirmar') {
        //Agregar el usuario
        Meeti.update(
            {'interesados': Sequelize.fn('array_append', Sequelize.col('interesados'), req.user.id)},
            {'where': {'slug': req.params.slug}}
        );
        res.send('Has confirmado tu asistencia');
    } else {
        //Quitar el usuario
        Meeti.update(
            {'interesados': Sequelize.fn('array_remove', Sequelize.col('interesados'), req.user.id)},
            {'where': {'slug': req.params.slug}}
        );
        res.send('Has cancelado tu asistencia');
    }    
}

//Mostrar lista asistentes
exports.mostrarAsistentes = async (req, res) => {
    const meeti = await Meeti.findOne({where: {slug: req.params.slug},
    attributes: ['interesados']});

    //Extraer interesados
    const {interesados} = meeti;
    const asistentes = await Usuarios.findAll({
        attributes: ['nombre', 'imagen'],
        where: {id: interesados}
    });

    //Crear la vista y pasar datos
    res.render('asistentes-meeti', {
        nombrePagina: 'Listado Asistentes Meeti',
        asistentes
    })
}

//Mostrar categoria
exports.mostrarCategoria = async (req, res, next) => {
    const categoria = await Categorias.findOne({attributes: ['id', 'nombre'], where: {slug: req.params.categoria}});
    const meetis = await Meeti.findAll({order: [['fecha', 'ASC'], ['hora', 'ASC']], include: [{model: Grupos, where: {categoriaId: categoria.id}}, {model: Usuarios}]});

    res.render('categoria', {
        nombrePagina: `Categoria: ${categoria.nombre}`,
        meetis,
        moment
    })
}