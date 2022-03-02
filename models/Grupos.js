const Sequelize = require('sequelize');
const db = require('../config/db');
const uuid = require('uuid').v4;
const Categorias = require('./Categorias');
const Usuarios = require('./Usuarios');

const Grupos = db.define('grupos', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: uuid()
    },
    nombre: {
        type: Sequelize.TEXT(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El grupo debe tener un nombre'
            }
        }
    },
    descripcion: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
            notEmpty:{
                msg: 'Coloca una descripcion'
            }
        }
    },
    url: Sequelize.TEXT,
    imagen: Sequelize.TEXT
})

//Cada vez que se cree un grupo tendremos la relacion de categoria usuario
Grupos.belongsTo(Categorias);
Grupos.belongsTo(Usuarios);

module.exports = Grupos;