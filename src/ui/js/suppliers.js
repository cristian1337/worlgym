table = 'proveedor';
modal = './pages/newSupplier.html';
fields = ['nombre', 'nit', 'direccion', 'email', 'telefono', 'estado'];
inactiveFields = ['nombre', 'nit'];
action = true;
button = 'Actualizar Proveedor';

var DataTable = $('#dataTable').DataTable({
    language: {
        url: 'español.json'
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
    dom: "<'row'<'col-md-3'B><'col-md-3'l><'col-md-6'f>r>t<'row'<'col-md-6'i><'col-md-6'p><'#colvis'>r>",
    buttons: [
        {
            extend: 'excel',
            autoFilter: true,
            Name: 'Datos'
        },
        { extend: 'pdf' },
    ],

    createdRow: function (row, data, dataIndex) {
        $(row).on("click", ".stateEdit", function (e) {
            e.preventDefault();
            var estado = $(this).closest("tr").find("td:last .stateEdit").attr("value");
            stateEdit(data[0], estado);
        });

        $(row).on("click", ".editData", function (e) {
            e.preventDefault();
            editData(data[0]);
        });
    }
});

dataLoad();

$("#create").click(function () {
    $("#Modal .modal-content").load(modal, function () {
        $("#Modal").modal({
            backdrop: 'static',
            keyboard: true,
            show: true
        });

        $("form").on('submit', function (e) {
            e.preventDefault();
            const jsonData = main.serializeForm($("#form").serializeArray());

            if (fields.includes('estado')) {
                jsonData.estado = 'activo';
            }

            insert = main.insertar(table, jsonData);
            $('#Modal').modal('hide');
            main.showNotification('Guardado', '!');
            setTimeout(function () { dataLoad(); }, 500);
        });
    });
});

async function dataLoad() {
    let data = await main.consultar("id" + table + "," + fields.join(','), table, "");
    var filas = [];
    $.each(data, function () {
        var stateEdit = '';

        if (fields.includes('estado')) {
            if (this.estado == 'activo') {
                stateEdit = '<button class="stateEdit btn btn-danger btn-xs" value="' + this.estado + '" title="Inactivar" style="margin-bottom:3px;margin: 0px 0px 0px 6px;"><span class="fas fa-xs fa-times"></span></button>';
            } else {
                stateEdit = '<button class="stateEdit btn btn-success btn-xs" value="' + this.estado + '" title="Activar" style="margin-bottom:3px;margin: 0px 0px 0px 6px;"><span class="fas fa-xs fa-check"></span></button>';
            }
        }
    
        edit = '<button class="editData btn btn-info btn-xs" title="Editar" style="margin-bottom:3px; margin: 0px 0px 0px 6px;"><span class="fas fa-xs fa-edit"></span></button>';

        var fila = {};
        fila[0] = this['id' + table];

        for (i = 0; i < fields.length; i++) {
            fila[i + 1] = this[fields[i]];            
        }

        if (action) {
            fila[fields.length + 1] = edit + ' ' + stateEdit;
        }

        filas.push(fila);
    });
    DataTable.clear().draw();
    DataTable.rows.add(filas).draw();
}

async function stateEdit(id, state) {

    if (state == 'activo') {
        state = 'inactivo';
    } else {
        state = 'activo';
    }

    const jsonData = {
        estado: state
    }

    update = main.actualizar(table, jsonData, 'id' + table + ' = ' + id);
    main.showNotification('Registro ' + state, '!');
    setTimeout(function () { dataLoad(); }, 500);
}

async function editData(id) {
    let data = await main.consultar("id" + table + "," + fields.join(','), table, "id" + table + " = " + id);
    $("#Modal .modal-content").load(modal, function () {
        $("#Modal").modal({
            backdrop: 'static',
            keyboard: true,
            show: true
        });

        for (i = 0; i < fields.length; i++) {
            $("[name='" + fields[i] + "']").val(data[0][fields[i]]);
        }

        for (i = 0; i < inactiveFields.length; i++) {
            $("[name='" + inactiveFields[i] + "']").attr('readonly', true);
        }

        $("#guardar").html(button);

        $("form").on('submit', function (e) {
            e.preventDefault();
            const jsonData = main.serializeForm($("#form").serializeArray());
            update = main.actualizar(table, jsonData, "id" + table + " = " + id);
            $('#Modal').modal('hide');
            main.showNotification('Registro Actualizado', '!');
            setTimeout(function () { dataLoad(); }, 500);
        });
    });
}