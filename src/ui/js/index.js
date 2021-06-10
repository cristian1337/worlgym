const { remote } = require('electron');
const main = require('../main.js');
let $ = window.jquery = require('../../node_modules/jquery');

let easy = require('../../node_modules/jquery.easing');

//Librerias datatables, botones exportar

window.dt = require('../../node_modules/datatables.net')();
let jszip = require( '../../node_modules/jszip' );
let pdfmake = require( '../../node_modules/pdfmake/build/pdfmake.js' );
let font = require('../../node_modules/pdfmake/build/vfs_fonts.js');
pdfmake.vfs = font.pdfMake.vfs;
let buttonsTable = require( '../../node_modules/datatables.net-buttons-dt/js/buttons.dataTables.js' )();
let buttonsHtml = require( '../../node_modules/datatables.net-buttons/js/buttons.html5.js' )( window, $, jszip, pdfmake );
let buttonsNet = require( '../../node_modules/datatables.net-buttons' )( window, $ );
let buttonsPrint = require( '../../node_modules/datatables.net-buttons/js/buttons.print.js' )( window, $ );
let estilo = require("../../node_modules/datatables.net-bs4/js/dataTables.bootstrap4.min.js")( window, $ );

let select2 = require('../../node_modules/select2/dist/js/select2.min.js')(window, $);

var arrayProducto = [];

$(document).ready(async function () {
    localStorage.setItem('idmesa', 0);
    // Nombre de la empresa
    let datosEmpresa = await main.consultar("valor", "configuracion", "nombre = 'empresa'");
    $("#empresa").html(datosEmpresa[0].valor);
    // Icono según tipo de negocio
    let icono = await main.consultar("valor", "configuracion", "nombre = 'icono'");
    $("#icon_empresa").addClass(icono[0].valor);
    // Slogan
    let slogan = await main.consultar("valor", "configuracion", "nombre = 'slogan'");
    $("#slogan").text(slogan[0].valor);

    $(".container-fluid").load('pages/inicio.html');

    $(".modules").click(function () {
        $(".collapse").removeClass('show');
        $(this).parent().parent().addClass('show');
        $(".container-fluid").load('pages/' + $(this).attr('enlace'));
    });

    $(".openModal").click(function () {
        $(".collapse").removeClass('show');
        $(this).parent().parent().addClass('show');
        $("#Modal .modal-content").load('./pages/' + $(this).attr('enlace'), async function () {
            $("#Modal").modal({
                backdrop: 'static',
                keyboard: true,
                show: true
            });
        });
    });
});