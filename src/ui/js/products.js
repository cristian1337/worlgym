table = 'producto';
modal = './pages/newProduct.html';
fields = ['categoria_idcategoria', 'nombre', 'descripcion', 'tipo', 'stock', 'precio_venta', 'estado'];
inactiveFields = ['nombre', 'tipo', 'stock'];
action = true;
button = 'Actualizar Producto';
var id = 0;
var screen = 1;

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
    });
});

async function dataLoad() {
    let data = await main.consultar("id" + table + "," + fields.join(','), table, "");
    var filas = [];
    for (const product of data) {
        var stateEdit = '';

        if (fields.includes('estado')) {
            if (product.estado == 'activo') {
                stateEdit = '<button class="stateEdit btn btn-danger btn-sm" value="' + product.estado + '" title="Inactivar" style="margin-bottom:3px;margin: 0px 0px 0px 6px;"><span class="fas fa-sm fa-times"></span></button>';
            } else {
                stateEdit = '<button class="stateEdit btn btn-success btn-sm" value="' + product.estado + '" title="Activar" style="margin-bottom:3px;margin: 0px 0px 0px 6px;"><span class="fas fa-sm fa-check"></span></button>';
            }
        }
    
        edit = '<button class="editData btn btn-info btn-sm" title="Editar" style="margin-bottom:3px; margin: 0px 0px 0px 6px;"><span class="fas fa-sm fa-edit"></span></button>';

        var fila = {};
        fila[0] = product['id' + table];

        for (i = 0; i < fields.length; i++) {
            if (fields[i] == 'categoria_idcategoria') {
                let categoria = await main.consultar("nombre", 'categoria', "idcategoria = " + product[fields[i]]);
                fila[i + 1] = categoria[0].nombre;
            } else {
                fila[i + 1] = product[fields[i]];
            }            
        }

        if (action) {
            fila[fields.length + 1] = edit + ' ' + stateEdit;
        }

        filas.push(fila);
    }
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

async function editData(idData) {
    id = idData;
    let data = await main.consultar("id" + table + "," + fields.join(','), table, "id" + table + " = " + id);
    let dataSupply = await main.consultar("insumo_idinsumo, ip.cantidad, i.nombre", 'insumo_producto ip, insumo i', "ip.insumo_idinsumo = i.idinsumo AND ip.producto_idproducto = " + id);
    
    arraySupply = [];
    $.each(dataSupply, function () {
        var fila = {
            insumo_idinsumo: this.insumo_idinsumo,
            insumo: this.nombre,
            cantidad: this.cantidad
        };

        // Se agregan los datos al arreglo de insumos
        arraySupply.push(fila);
    });

    $("#Modal .modal-content").load(modal, function () {
        $("#Modal").modal({
            backdrop: 'static',
            keyboard: true,
            show: true
        });

        for (i = 0; i < fields.length; i++) {
            if ($("[name='" + fields[i] + "']").attr('type') == 'radio') {
                $("[name='" + fields[i] + "'][value='" + data[0][fields[i]] + "']").click();
            } else if (fields[i] == 'categoria_idcategoria') {
                main.optionSelect2(fields[i], data[0][fields[i]]);
            } else if (fields[i] == 'precio_venta') {
                $("[name='" + fields[i] + "']").val(main.coin(data[0][fields[i]].toString()));
            } else {
                $("[name='" + fields[i] + "']").val(data[0][fields[i]]);
            }
        }

        for (i = 0; i < inactiveFields.length; i++) {
            $("[name='" + inactiveFields[i] + "']").attr('readonly', true);
        }

        $("#guardar").html(button);
    });
}