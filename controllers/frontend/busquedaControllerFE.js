const Meeti = require('../../models/Meeti');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');

exports.resultadosBusqueda = async (req, res, next) => {
    //Leer datos de la url
    const {categoria, titulo, ciudad, pais } = req.query;

    let query;
    if(categoria === '') {
        query = '';
    } else {
        query = `where: {
            categoriaId: {[Op.eq] : ${categoria} },
        }`;
    }
    //Filtara meetis
    const meetis = await Meeti.findAll({
        where: {
            titulo: { [Op.iLike] : '%'+ titulo + '%' },
            ciudad: { [Op.iLike] : '%'+ ciudad + '%' },
            pais: { [Op.iLike] : '%'+ pais + '%' },
        },
        include: [
            {
                model: Grupos,
                query
            },
            {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    });

    //Pasar los resultados a la vista
    res.render('busqueda', {
        nombrePagina: 'Resultados Busqueda',
        meetis,
        moment
    })
}