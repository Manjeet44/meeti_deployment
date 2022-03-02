const Sequelize = require('sequelize');
const db = require('../config/db');
const uuid = require('uuid').v4;
const slug = require('slug');
const shortid = require('shortid');

const Usuarios = require('../models/Usuarios');
const Grupos = require('../models/Grupos');


const Meeti = db.define(
    'meeti', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: uuid()
        },
        titulo: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Agrega un Titulo'
                }
            }
        },
        slug: {
            type: Sequelize.STRING
        },
        invitado: Sequelize.STRING,
        cupo: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        descripcion: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Agrega una descripcion'
                }
            }
        },
        fecha: {
            type: Sequelize.DATEONLY,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Agrega una fecha para el Meeti'
                }
            }
        },
        hora: {
            type: Sequelize.TIME,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Agrega una Hora para el Meeti'
                }
            }
        },
        direccion: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Agrega una Direccion'
                }
            }
        },
        ciudad: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Agrega una Ciudad'
                }
            }
        },
        estado: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Agrega un estado'
                }
            }
        },
        pais: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Agrega un Pais'
                }
            }
        },
        ubicacion: {
            type: Sequelize.GEOMETRY('POINT')
        },
        interesados: {
            type: Sequelize.ARRAY(Sequelize.INTEGER),
            defaultValue: []
        }

    }, {
        hooks: {
            async beforeCreate(meeti) {
                const url = slug(meeti.titulo).toLowerCase();
                meeti.slug = `${url}-${shortid.generate()}`;
                meeti.grupoId = meeti.grupoId.trim();
            }
        }
    }
);
Meeti.belongsTo(Usuarios);
Meeti.belongsTo(Grupos);

module.exports = Meeti;


