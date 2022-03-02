const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const gruposController = require('../controllers/gruposController');
const meetiController = require('../controllers/meetiController');
const meetiControllerFE = require('../controllers/frontend/meetiControllerFE');
const usuariosControllerFE = require('../controllers/frontend/usuariosControllerFE');
const gruposControllerFE = require('../controllers/frontend/gruposControllerFE');
const comentariosControllerFE = require('../controllers/frontend/comentariosControllerFE');
const busquedaControllerFE = require('../controllers/frontend/busquedaControllerFE');

module.exports = function() {
    /* Area Publica */
    
    router.get('/', homeController.home);

    //Muestra un meeti
    router.get('/meeti/:slug',
        meetiControllerFE.mostrarMeeti
    );

    //Confirma asistencia a Meeti
    router.post('/confirmar-asistencia/:slug',
        meetiControllerFE.confirmarAsistencia
    );

    //Muestra asistentes al meeti
    router.get('/asistentes/:slug', 
        meetiControllerFE.mostrarAsistentes
    );

    //Comentarios en el Meeti
    router.post('/meeti/:id',
        comentariosControllerFE.agregarComentario
    );

    //Elimina Comentarios en el meeti
    router.post('/eliminar-comentario',
        comentariosControllerFE.eliminarComentario
    );

    //Muestra perfiles en el front end
    router.get('/usuarios/:id',
        usuariosControllerFE.mostrarUsuario
    );

    //Muestra los grupos en el FE
    router.get('/grupos/:id',
        gruposControllerFE.mostrarGrupo
    );

    //Muestra meetis por categoria
    router.get('/categoria/:categoria',
        meetiControllerFE.mostrarCategoria
    );

    //Añade la busqueda
    router.get('/busqueda',
        busquedaControllerFE.resultadosBusqueda
    );

    //Crear y confirmar cuentas
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    //Almacenar datos del fomrulario usuario
    router.post('/crear-cuenta', usuariosController.crearNuevoUsuario);
    router.get('/confirmar-cuenta/:correo', usuariosController.confirmarCuenta);
    //Iniciar sesion
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion );
    router.post('/iniciar-sesion', authController.autenticarUsuario);

    //Cerrar sesion
    router.get('/cerrar-sesion',
        authController.usuarioAutenticado,
        authController.cerrarSesion
    );

    /* Area Privada */

    //Panel de administracion
    router.get('/administracion', 
        authController.usuarioAutenticado,
        adminController.panelAdministracion
    );

    //Nuevos grupos
    router.get('/nuevo-grupo',
        authController.usuarioAutenticado,
        gruposController.formNuevoGrupo
    
    );

    router.post('/nuevo-grupo',
        authController.usuarioAutenticado,
        gruposController.subirImagen,
        gruposController.crearGrupo
    );

    //Editar grupos
    router.get('/editar-grupo/:grupoId', 
        authController.usuarioAutenticado,
        gruposController.formEditarGrupo
    );
    router.post('/editar-grupo/:grupoId', 
        authController.usuarioAutenticado,
        gruposController.editarGrupo
    );

    //Editar imagen del grupo
    router.get('/imagen-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.formEditarImagen
    );
    router.post('/imagen-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.subirImagen,
        gruposController.editarImagen
    );


    //Eliminar grupos
    router.get('/eliminar-grupo/:grupoId', 
        authController.usuarioAutenticado,
        gruposController.formEliminarGrupo
    );
    router.post('/eliminar-grupo/:grupoId', 
        authController.usuarioAutenticado,
        gruposController.eliminarGrupo
    );

    //Nuevos Meeti
    router.get('/nuevo-meeti', 
        authController.usuarioAutenticado,
        meetiController.formNuevoMeeti
    );

    router.post('/nuevo-meeti', 
        authController.usuarioAutenticado,
        meetiController.sanitizarMeeti,
        meetiController.crearMeeti
    );

    //Editar Meeti
    router.get('/editar-meeti/:id',
        authController.usuarioAutenticado,
        meetiController.formEditarMeeti
    );

    //Guardar cambios Meeti
    router.post('/editar-meeti/:id',
        authController.usuarioAutenticado,
        meetiController.editarMeeti
    );

    //Eliminar Meeti
    router.get('/eliminar-meeti/:id',
        authController.usuarioAutenticado,
        meetiController.formEliminarMeeti
    );
    router.post('/eliminar-meeti/:id',
        authController.usuarioAutenticado,
        meetiController.eliminarMeeti
    );

    //Editar informacion de perfil
    router.get('/editar-perfil',
        authController.usuarioAutenticado,
        usuariosController.formEditarPerfil
    );
    router.post('/editar-perfil',
        authController.usuarioAutenticado,
        usuariosController.editarPerfil
    );

    //Cambiar Password
    router.get('/cambiar-password',
        authController.usuarioAutenticado,
        usuariosController.formCambiarPassword
    );
    router.post('/cambiar-password',
        authController.usuarioAutenticado,
        usuariosController.cambiarPassword
    );

    //Imagenes de perfil
    router.get('/imagen-perfil', 
        authController.usuarioAutenticado,
        usuariosController.formSubirImagenPerfil
    );
    router.post('/imagen-perfil', 
        authController.usuarioAutenticado,
        usuariosController.subirImagen,
        usuariosController.guardarImagenPerfil
    );
    
    return router;
}