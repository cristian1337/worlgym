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

        $(row).on("click", ".editarProv", function (e) {
            e.preventDefault();
            editarProv(data[0]);
        });
    }
});

cargarSuppliers();

$("#create").click(function () {
    $("#Modal .modal-content").load('./pages/newSupplier.html', function () {
        $("#Modal").modal({
            backdrop: 'static',
            keyboard: true,
            show: true
        });

        $("#guardar").click(function () {
            const proveedor = {
                Nombre: $("#nombre").val(),
                Nit: $("#nit").val(),
                Direccion: $("#direccion").val(),
                Email: $("#email").val(),
                Telefono: $("#telefono").val(),
                Estado: 'activo'
            }
            insert = main.insertar('Proveedor', proveedor);
            $('#Modal').modal('hide');
            main.showNotification('Guardado', 'Información');
            setTimeout(function () { cargarSuppliers(); }, 500);
        });
    });
});

async function cargarSuppliers() {
    let datosProveedor = await main.consultar("idProveedor, Nombre, Nit, Direccion, Email, Telefono, Estado", "Proveedor", "");
    var filas = [];
    $.each(datosProveedor, function () {
        if (this.Estado == 'activo') {
            editarEstado = '<button class="cambiaEstado btn btn-danger btn-xs" value="' + this.Estado + '" title="Inactivar" style="margin-bottom:3px;margin: 0px 0px 0px 6px;"><span class="fas fa-xs fa-times"></span></button>';
        } else {
            editarEstado = '<button class="cambiaEstado btn btn-success btn-xs" value="' + this.Estado + '" title="Activar" style="margin-bottom:3px;margin: 0px 0px 0px 6px;"><span class="fas fa-xs fa-check"></span></button>';
        }

        editar = '<button class="editarProv btn btn-info btn-xs" title="Editar" style="margin-bottom:3px; margin: 0px 0px 0px 6px;"><span class="fas fa-xs fa-edit"></span></button>';

        var fila = {
            0: this.idProveedor,
            1: this.Nombre,
            2: this.Nit,
            3: this.Direccion,
            4: this.Email,
            5: this.Telefono,
            6: this.Estado,
            7: editar + ' ' + editarEstado
        }
        filas.push(fila);
    });
    DTtblCtg.clear().draw();
    DTtblCtg.rows.add(filas).draw();
}

async function cambiarEstado(id, estado) {
    if (estado == 'activo') {
        estado = 'inactivo';
    } else {
        estado = 'activo';
    }
    const proveedor = {
        Estado: estado
    }
    update = main.actualizar('Proveedor', proveedor, 'idProveedor = ' + id);
    main.showNotification('Dato Actualizado', 'Información');
    setTimeout(function () { cargarSuppliers(); }, 500);
}

async function editarProv(id) {
    let datosProveedor = await main.consultar("idProveedor, Nombre, Nit, Direccion, Email, Telefono, Estado", "Proveedor", "idProveedor = " + id);
    $("#Modal .modal-content").load('./pages/newSupplier.html', function () {
        $("#Modal").modal({
            backdrop: 'static',
            keyboard: true,
            show: true
        });

        $("#guardar").click(function () {
            const proveedor = {
                Nombre: $("#nombre").val(),
                Nit: $("#nit").val(),
                Direccion: $("#direccion").val(),
                Email: $("#email").val(),
                Telefono: $("#telefono").val()
            }
            insert = main.actualizar('Proveedor', proveedor, 'idProveedor = ' + id);
            $('#Modal').modal('hide');
            main.showNotification('Proveedor actualizado', 'Información');
            setTimeout(function () { cargarSuppliers(); }, 500);
        });

        
        $("#nombre").val(datosProveedor[0].Nombre);
        $("#nombre").attr('readonly', true);
        $("#nit").val(datosProveedor[0].Nit);
        $("#nit").attr('readonly', true);
        $("#direccion").val(datosProveedor[0].Direccion);
        $("#email").val(datosProveedor[0].Email);
        $("#telefono").val(datosProveedor[0].Telefono);

    });
}