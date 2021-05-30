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

    $(".openModalVenta").click(function () {
        $(".collapse").removeClass('show');
        $(this).parent().parent().addClass('show');
        $("#Modal .modal-content").load('./pages/' + $(this).attr('enlace'), async function () {
            arrayProducto = [];
            $("#Modal").modal({
                backdrop: 'static',
                keyboard: true,
                show: true
            });

            $("#fecha").val(actualDate());

            var DTtblVent = $('#dataTableVenta').DataTable({
                "language": {
                    "lengthMenu": "Mostrar _MENU_ registros por página",
                    "zeroRecords": "Registros no encontrados",
                    "info": "Página _PAGE_ de _PAGES_",
                    "infoEmpty": "Registros no disponibles",
                    "infoFiltered": "( Filtrados de _MAX_ registros)",
                    "search": "Buscar",
                    "paginate": {
                        "next": "Siguiente",
                        "previous": "Anterior"
                    }
                },
                processing: true,
                pageLength: 10,
                columnDefs: [
                    {
                        "className": "dt-center",
                        "targets": "_all"
                    },
                    {
                        targets: [0],
                        visible: false
                    }
                ],
                autoWidth: true,
                order: [1, 'asc'],

                createdRow: function (row, data, dataIndex) {

                }
            });

            let datosProducto = await main.consultar("idProducto, Nombre, Descripcion, Stock, PrecioVenta", "Producto", "Estado = 'activo' ORDER BY Nombre ASC");
            var selectProducto = '<select  name="producto" class="form-control producto">';
            selectProducto += '<option value="">Seleccione...</option>';
            $.each(datosProducto, function () {
                selectProducto += '<option value="' + this.idProducto + '" stock="' + this.Stock + '" precio="' + this.PrecioVenta + '">' + this.Nombre + ' (' + this.Descripcion + ')</option>';
            });
            selectProducto += '</select>';

            inputCantidad = '<input style="width: 70px;" type="number" min="1" name="cantidad">';
            inputPrecio = '<input style="width: 100px;" type="number" min="1000" name="precio">';

            $("[id=agregarProductoV]").on("click", function (e) {
                e.preventDefault();
                $(".agregarProductoV").prop("disabled", true);
                var row = {
                    0: '',
                    1: selectProducto,
                    2: inputCantidad,
                    3: inputPrecio,
                    4: '',
                    5: "<center><button type='button' class='btnGuardarDV btn btn-primary btn-xs' title='Guardar' style='margin-right:5px'><i class='fas fa-save fa-xs'></i></button><button type='button' class='btn btn-danger btn-xs LimpiarDV' title='Eliminar'><i class='fas fa-eraser fa-xs'></i></button></center>"
                }
                DTtblVent.row.add(row).draw();
                DTtblVent.order([0, 'asc']).draw();

                $(".producto").off("change").on("change", function (e) {
                    var precio = $(this).find('option:selected').attr('precio');
                    $("[name='precio']").val(precio);
                    var producto_idproducto = $(this).closest('tr').find('td:eq(1) select').val();
                    $(this).closest('tr').find('td:eq(0)').text(producto_idproducto);
                });

                $("[name='cantidad']").off("change").on("change", function (e) {
                    var disponible = parseFloat($("[name='producto']").find('option:selected').attr('stock').trim());
                    var cant = parseFloat($(this).val().trim());
                    if (cant > disponible) {
                        main.showNotification('No existen existencias suficientes del producto', 'Error');
                        $(this).val(disponible);
                    }
                });

                $("[id=dataTableVenta]").on("click", ".LimpiarDV", function (e) {
                    e.preventDefault();
                    if ($(this).val() == '') {
                        DTtblVent.row($(this).closest('tr')).remove().draw();
                        $(".agregarProductoV").prop("disabled", false);
                    } else {
                        arrayProducto.splice($(this).val(), 1);
                        arrayProducto.sort();
                        DTtblVent.row($(this).closest('tr')).remove().draw();
                        agregarProducto(DTtblVent);
                    }
                    totalPedido();
                });

                $("[id=dataTableVenta]").on("click", ".btnGuardarDV", function (e) {
                    e.preventDefault();
                    if ($("[name='producto']").val() == '' ||
                        $("[name='cantidad']").val() == '' ||
                        $("[name='precio']").val() == ''
                    ) {
                        main.showNotification('Llenar todos los campos', 'Error');
                        return false;
                    } else {
                        var disponible = parseFloat($("[name='producto']").find('option:selected').attr('stock').trim());
                        var cant = parseFloat($(this).val().trim());
                        if (cant > disponible) {
                            main.showNotification('No existen existencias suficientes del producto', 'Error');
                            $(this).val(disponible);
                            return false;
                        }
                    }

                    var fila = {
                        producto_idproducto: $("[name='producto']").val(),
                        nombre: $("[name='producto']").find('option:selected').text(),
                        cantidad: parseFloat($("[name='cantidad']").val().trim()),
                        precio: parseFloat($("[name='precio']").val().trim()),
                        valor_total: $("[name='cantidad']").val().trim() * $("[name='precio']").val().trim(),
                        disponible: parseFloat($("[name='producto']").find('option:selected').attr('stock').trim())
                    };
                    arrayProducto.push(fila);
                    $(".agregarProductoV").prop("disabled", false);
                    agregarProducto(DTtblVent);
                    totalPedido();
                });
            });

            $("#guardar_venta").click(async function () {

                if (arrayProducto.length == 0) {
                    main.showNotification('No existen productos a ingresar', 'Error');
                    return false;
                }

                var total = $("#valor_total").val();
                total = total.replace(/\./g, '');
                const Venta = {
                    Fecha: $("#fecha").val(),
                    ValorTotal: total,
                    Usuario_idUsuario: $("#usuario").val()
                }

                insertVenta = await main.insertar('Venta', Venta);

                var datoVenta = await main.consultar("idVenta", "Venta", "1 = 1 ORDER BY idVenta DESC");

                $.each(arrayProducto, function () {
                    const ProductoVenta = {
                        Venta_idVenta: datoVenta[0].idVenta,
                        Producto_idProducto: this.producto_idproducto,
                        Cantidad: this.cantidad,
                        ValorUnitario: this.precio
                    }

                    insertProd = main.insertar('ProductosVenta', ProductoVenta);

                    const Producto = {
                        Stock: this.disponible - this.cantidad
                    }

                    updateProd = main.actualizar('Producto', Producto, "idProducto = " + this.producto_idproducto);
                });

                $('#Modal').modal('hide');
                main.showNotification('Venta Realizada', 'Información');

                //Imprimir
                const electron = require('electron')
                // Importing BrowserWindow from Main 
                const BrowserWindow = electron.remote.BrowserWindow;

                var current = document.getElementById('current');
                var options = {
                    silent: false,
                    printBackground: true,
                    color: false,
                    margin: {
                        marginType: 'printableArea'
                    },
                    landscape: false,
                    pagesPerSheet: 1,
                    collate: false,
                    copies: 1,
                    header: 'Header of the Page',
                    footer: 'Footer of the Page'
                }

                let window;
                data = { "tipo": 1, "id": datoVenta[0].idVenta }
                window = newWindowImprimir('src/ui/pages/factura.html', 220, 400, window, data);
                window.on('shown', () => { window.focus() }); window.show();
                let win = BrowserWindow.getFocusedWindow();

                function newWindowImprimir(location, wt = 1200, ht = 1000, window, data = {}) {
                    window = new BrowserWindow({
                        width: wt,
                        height: ht,
                        webPreferences: {
                            nodeIntegration: true,
                            enableRemoteModule: true
                        }
                    })
                    window.loadFile(location, { query: { "data": JSON.stringify(data) } });
                    return window;
                };
            });
        });
    });
});