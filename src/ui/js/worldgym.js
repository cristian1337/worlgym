const { remote } = require('electron');
const main = require('../main.js');

var arrayProducto = [];

$(document).ready(async function () {
    let datosEmpresa = await main.consultar("Valor", "Configuracion", "Nombre = 'empresa'");
    $("#empresa").html(datosEmpresa[0].Valor);
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

            let datosCategorias = await main.consultar("Nombre, idCategoria", "Categoria", "estado = 'activo' AND idCategoria > 0 ORDER BY Nombre ASC");
            $.each(datosCategorias, function () {
                $("#categoria").append('<option value="' + this.idCategoria + '">' + this.Nombre + '</option>');
            });

            $("#guardar").click(function () {
                const Producto = {
                    Nombre: $("#nombre").val(),
                    Descripcion: $("#descripcion").val(),
                    Stock: $("#stock").val(),
                    Costo: $("#costo").val(),
                    PrecioVenta: $("#precio_venta").val(),
                    Categoria_idCategoria: $("#categoria").val(),
                    Estado: 'activo'
                }
                insert = main.insertar('Producto', Producto);
                $('#Modal').modal('hide');
                main.showNotification('Producto guardado', 'Información');
            });
        });
    });

    $(".openModalIngreso").click(function () {
        $(".collapse").removeClass('show');
        $(this).parent().parent().addClass('show');
        $("#Modal .modal-content").load('./pages/' + $(this).attr('enlace'), async function () {
            $("#Modal").modal({
                backdrop: 'static',
                keyboard: true,
                show: true
            });

            let datosProveedor = await main.consultar("Nombre, Nit, idProveedor", "Proveedor", "Estado = 'activo' ORDER BY Nombre ASC");
            $.each(datosProveedor, function () {
                $("#proveedor").append('<option value="' + this.idProveedor + '">' + this.Nombre + '(' + this.Nit + ')</option>');
            });
            $("#fecha").val(actualDate());

            var DTtblIng = $('#dataTableIngreso').DataTable({
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

            $("[id=agregarProducto]").on("click", function (e) {
                e.preventDefault();
                $(".agregarProducto").prop("disabled", true);
                var row = {
                    0: '',
                    1: selectProducto,
                    2: inputCantidad,
                    3: inputPrecio,
                    4: '',
                    5: "<center><button type='button' class='btnGuardarDV btn btn-primary btn-xs' title='Guardar' style='margin-right:5px'><i class='fas fa-save fa-xs'></i></button><button type='button' class='btn btn-danger btn-xs LimpiarDV' title='Eliminar'><i class='fas fa-eraser fa-xs'></i></button></center>"
                }
                DTtblIng.row.add(row).draw();
                DTtblIng.order([0, 'asc']).draw();
    
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

                $("[id=dataTableIngreso]").on("click", ".LimpiarDV", function (e) {
                    e.preventDefault();
                    if ($(this).val() == '') {
                        DTtblIng.row($(this).closest('tr')).remove().draw();
                        $(".agregarProducto").prop("disabled", false);
                    } else {
                        arrayProducto.splice($(this).val(), 1);
                        arrayProducto.sort();
                        DTtblIng.row($(this).closest('tr')).remove().draw();
                        agregarProducto(DTtblIng);
                    }
                    totalPedido();
                });

                $("[id=dataTableIngreso]").on("click", ".btnGuardarDV", function (e) {
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
                    $(".agregarProducto").prop("disabled", false);
                    agregarProducto(DTtblIng);
                    totalPedido();
                });
            });

            $("#guardar_ingreso").click(async function () {
                
                if ($("#fecha").val() == '' || $("#proveedor").val() == '') {
                    main.showNotification('Por favor seleccione un proveedor', 'Error');
                    return false;
                } else {
                    if (arrayProducto.length == 0) {
                        main.showNotification('No existen productos a ingresar', 'Error');
                        return false;
                    }
                }

                const Pedido = {
                    Fecha: $("#fecha").val(),
                    ValorTotal: $("#valor_total").val(),
                    Usuario_idUsuario: $("#usuario").val(),
                    Proveedor_idProveedor: $("#proveedor").val()
                }

                insertPed = await main.insertar('Ingreso', Pedido);

                var datoPedido = await main.consultar("idIngreso", "Ingreso", "1 = 1 ORDER BY idIngreso DESC");

                $.each(arrayProducto, function() {
                    const ProductoPedido = {
                        Ingreso_idIngreso: datoPedido[0].idIngreso,
                        Producto_idProducto: this.producto_idproducto,
                        Cantidad: this.cantidad,
                        ValorUnitario: this.precio
                    }

                    insertProd = main.insertar('ProductosIngreso', ProductoPedido);
                    
                    const Producto = {
                        Stock: this.disponible - this.cantidad
                    }

                    updateProd = main.actualizar('Producto', Producto, "idProducto = " + this.producto_idproducto);
                });

                $('#Modal').modal('hide');
                main.showNotification('Pedido guardado', 'Información');
            });
        });
    });
});

function totalPedido(){
    var suma = 0;
    $.each(arrayProducto, function() {
        suma += parseFloat(this.valor_total);
    });
    $("#valor_total").val(suma);
}

function agregarProducto(DTtblIng) {
    if (arrayProducto.length > 0) {
        var filas = [];

        for (let i = 0; i < arrayProducto.length; i++) {
            var fila = {
                0: arrayProducto[i].producto_idproducto,
                1: arrayProducto[i].nombre,
                2: arrayProducto[i].cantidad,
                3: arrayProducto[i].precio,
                4: arrayProducto[i].valor_total,
                5: "<center><button type='button' class='btn btn-danger btn-xs LimpiarDV' value=" + i + " title='Eliminar'><i class='fas fa-eraser fa-xs'></i></button></center>"
            };
            filas.push(fila);
        }
        DTtblIng.clear().draw();
        DTtblIng.rows.add(filas).draw();
        DTtblIng.order([0, 'asc']).draw();
    }
}

function actualDate() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}