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
        $(row).on("click", ".cambiaestado", function (e) {
            e.preventDefault();
            var estado = $(this).closest("tr").find("td:last .cambiaestado").attr("value");
            cambiarestado(data[0], estado);
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
                nombre: $("#nombre").val(),
                estado: 'activo'
            }
            insert = main.insertar('categoria', categoria);
            $('#Modal').modal('hide');
            main.showNotification('Guardado', 'Información');
            setTimeout(function () { cargarCategories(); }, 500);
        });
    });
});

async function cargarCategories() {
    let datoscategorias = await main.consultar("nombre, idcategoria, estado", "categoria", "idcategoria > 0");
    var filas = [];
    $.each(datoscategorias, function () {
        if (this.estado == 'activo') {
            elimina = '<button class="cambiaestado btn btn-danger btn-xs" value="' + this.estado + '" title="Inactivar" style="margin-bottom:3px;margin: 0px 0px 0px 6px;"><span class="fas fa-xs fa-times"></span></button>';
        } else {
            elimina = '<button class="cambiaestado btn btn-success btn-xs" value="' + this.estado + '" title="Activar" style="margin-bottom:3px;margin: 0px 0px 0px 6px;"><span class="fas fa-xs fa-check"></span></button>';
        }

        var fila = {
            0: this.idcategoria,
            1: this.nombre,
            2: this.estado,
            3: elimina,
        }
        filas.push(fila);
    });
    DTtblCtg.clear().draw();
    DTtblCtg.rows.add(filas).draw();
}

async function cambiarestado(idcategoria, estado) {
    if (estado == 'activo') {
        estado = 'inactivo';
    } else {
        estado = 'activo';
    }
    const categoria = {
        estado: estado
    }
    update = main.actualizar('categoria', categoria, 'idcategoria = ' + idcategoria);
    main.showNotification('Dato Actualizado', 'Información');
    setTimeout(function () { cargarCategories(); }, 500);
}