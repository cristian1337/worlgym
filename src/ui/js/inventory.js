table = 'insumo';
fields = ['nombre', 'descripcion', 'stock'];

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
        {
            extend: 'pdf'
        },
    ],

    createdRow: function (row, data, dataIndex) {}
});

dataLoad();

async function dataLoad() {
    let data = await main.consultar(fields.join(','), table, "");
    var filas = [];
    $.each(data, function () {
        var fila = {};
        fila[0] = 'Insumo';

        for (i = 0; i < fields.length; i++) {
            fila[i + 1] = this[fields[i]];
        }

        filas.push(fila);
    });

    let dataProduct = await main.consultar(fields.join(','), 'producto', "");
    $.each(dataProduct, function () {
        var fila = {};
        fila[0] = 'Producto';

        for (i = 0; i < fields.length; i++) {
            fila[i + 1] = this[fields[i]];
        }

        filas.push(fila);
    });
    DataTable.clear().draw();
    DataTable.rows.add(filas).draw();
}