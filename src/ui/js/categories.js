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
    }
});

cargarCategories();

$("#createCategorie").click(function () {
    $("#Modal .modal-content").load('./pages/newCategorie.html', function () {
        $("#Modal").modal({
            backdrop: 'static',
            keyboard: true,
            show: true
        });

        $("#guardar_categoria").click(function () {
            const categoria = {
                Nombre: $("#nombre").val(),
                Estado: 'activo'
            }
            insert = main.insertar('Categoria', categoria);
            $('#Modal').modal('hide');
            main.showNotification('Guardado', 'Información');
            setTimeout(function () { cargarCategories(); }, 500);
        });
    });
});

async function cargarCategories() {
    let datosCategorias = await main.consultar("Nombre, idCategoria, Estado", "Categoria", "idCategoria > 0");
    var filas = [];
    $.each(datosCategorias, function () {
        if (this.Estado == 'activo') {
            elimina = '<button class="cambiaEstado btn btn-danger btn-xs" value="' + this.Estado + '" title="Inactivar" style="margin-bottom:3px;margin: 0px 0px 0px 6px;"><span class="fas fa-xs fa-times"></span></button>';
        } else {
            elimina = '<button class="cambiaEstado btn btn-success btn-xs" value="' + this.Estado + '" title="Activar" style="margin-bottom:3px;margin: 0px 0px 0px 6px;"><span class="fas fa-xs fa-check"></span></button>';
        }

        var fila = {
            0: this.idCategoria,
            1: this.Nombre,
            2: this.Estado,
            3: elimina,
        }
        filas.push(fila);
    });
    DTtblCtg.clear().draw();
    DTtblCtg.rows.add(filas).draw();
}

async function cambiarEstado(idCategoria, estado) {
    if (estado == 'activo') {
        estado = 'inactivo';
    } else {
        estado = 'activo';
    }
    const categoria = {
        Estado: estado
    }
    update = main.actualizar('Categoria', categoria, 'idCategoria = ' + idCategoria);
    main.showNotification('Dato Actualizado', 'Información');
    setTimeout(function () { cargarCategories(); }, 500);
}