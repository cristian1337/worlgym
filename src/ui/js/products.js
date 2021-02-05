var DTtblCtg = $('#dataTable').DataTable({
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
        $(row).on("click", ".cambiaEstado", function (e) {
            e.preventDefault();
            var estado = $(this).closest("tr").find("td:last .cambiaEstado").attr("value");
            cambiarEstado(data[0], estado);
        });

        $(row).on("click", ".editarDatos", function (e) {
            e.preventDefault();
            editarDatos(data[0]);
        });
    }
});

cargarProducts();

$("#create").click(async function () {
    $("#Modal .modal-content").load('./pages/newProduct.html', async function () {
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
            setTimeout(function () { cargarProducts(); }, 500);
        });
    });
});

async function cargarProducts() {
    let datosProducto = await main.consultar("idProducto, Nombre, Descripcion, Stock, Costo, PrecioVenta, Categoria_idCategoria, Estado", "Producto", "");
    var filas = [];
    for (const Producto of datosProducto) {
    //$.each(datosProducto, async function () {
        if (Producto.Estado == 'activo') {
            editarEstado = '<button class="cambiaEstado btn btn-danger btn-xs" value="' + Producto.Estado + '" title="Inactivar" style="margin-bottom:3px;margin: 0px 0px 0px 6px;"><span class="fas fa-xs fa-times"></span></button>';
        } else {
            editarEstado = '<button class="cambiaEstado btn btn-success btn-xs" value="' + Producto.Estado + '" title="Activar" style="margin-bottom:3px;margin: 0px 0px 0px 6px;"><span class="fas fa-xs fa-check"></span></button>';
        }

        editar = '<button class="editarDatos btn btn-info btn-xs" title="Editar" style="margin-bottom:3px; margin: 0px 0px 0px 6px;"><span class="fas fa-xs fa-edit"></span></button>';

        let categoria = await main.consultar("Nombre", "Categoria", "idCategoria = " + Producto.Categoria_idCategoria);

        var fila = {
            0: Producto.idProducto,
            1: Producto.Nombre,
            2: Producto.Descripcion,
            3: Producto.Stock,
            4: Producto.Costo,
            5: Producto.PrecioVenta,
            6: categoria[0].Nombre,
            7: Producto.Estado,
            8: editar + ' ' + editarEstado
        }
        filas.push(fila);
    }
    //});
    DTtblCtg.clear().draw();
    DTtblCtg.rows.add(filas).draw();
}

async function cambiarEstado(id, estado) {
    if (estado == 'activo') {
        estado = 'inactivo';
    } else {
        estado = 'activo';
    }
    const Producto = {
        Estado: estado
    }
    update = main.actualizar('Producto', Producto, 'idProducto = ' + id);
    main.showNotification('Estado Actualizado', 'Información');
    setTimeout(function () { cargarProducts(); }, 500);
}

async function editarDatos(id) {
    let datosProducto = await main.consultar("idProducto, Nombre, Descripcion, Stock, Costo, PrecioVenta, Categoria_idCategoria, Estado", "Producto", "idProducto = " + id);
    let datosCategorias = await main.consultar("Nombre, idCategoria", "Categoria", "estado = 'activo' AND idCategoria > 0 ORDER BY Nombre ASC");
    $("#Modal .modal-content").load('./pages/newProduct.html', function () {
        $("#Modal").modal({
            backdrop: 'static',
            keyboard: true,
            show: true
        });

        $(".modal-title").html("Editar Producto");

        $("#guardar").click(function () {
            const Producto = {
                Nombre: $("#nombre").val(),
                Descripcion: $("#descripcion").val(),
                PrecioVenta: $("#precio_venta").val(),
                Categoria_idCategoria: $("#categoria").val()
            }
            insert = main.actualizar('Producto', Producto, 'idProducto = ' + id);
            $('#Modal').modal('hide');
            main.showNotification('Producto actualizado', 'Información');
            setTimeout(function () { cargarProducts(); }, 500);
        });

        $.each(datosCategorias, function () {
            $("#categoria").append('<option value="' + this.idCategoria + '">' + this.Nombre + '</option>');
        });
        
        $("#nombre").val(datosProducto[0].Nombre);
        $("#descripcion").val(datosProducto[0].Descripcion);
        $("#stock").val(datosProducto[0].Stock);
        $("#precio_venta").val(datosProducto[0].PrecioVenta);
        $("#categoria [value=" + datosProducto[0].Categoria_idCategoria + "]").attr('selected', true);
        
        $("#nombre").attr('readonly', true);
        $("#stock").attr('readonly', true);
        $("#costo").parent().hide();
    });
}