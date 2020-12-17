const { remote } = require('electron');
const main = require('../main.js');

$(document).ready(async function(){
    let datosEmpresa = await main.consultar("Valor", "Configuracion", "Nombre = 'empresa'");
    $("#empresa").html(datosEmpresa[0].Valor);
    $(".container-fluid").load('pages/inicio.html');

    $(".modules").click(function(){
        $(".collapse").removeClass('show');
        $(this).parent().parent().addClass('show');
        $(".container-fluid").load('pages/' + $(this).attr('enlace'));
    });
});