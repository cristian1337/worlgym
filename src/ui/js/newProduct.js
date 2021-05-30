if (typeof id === 'undefined') {
    arraySupply = [];    
}

fields = ['categoria_idcategoria', 'nombre', 'descripcion', 'tipo', 'stock', 'precio_venta', 'estado'];
table = 'producto';

function activateType() {
    $("#insumos").hide();
    $("#stock").hide();
    if ($("[name='tipo']:checked").val() == 'compuesto') {
        $("#insumos").show();
        $("[name='stock']").val('0');
    } else if ($("[name='tipo']:checked").val() == 'simple') {
        $("#stock").show();
    }
}

$(document).ready(async function () {
    let dataCategory = await main.consultar("idcategoria AS id, nombre AS text", "categoria", "estado = 'activo'");

    $("[name='categoria_idcategoria']").select2({
        theme: "bootstrap",
        placeholder: "Categoría...",
        allowClear: true,
        data: dataCategory
    });

    $("[name='categoria_idcategoria']").val('').trigger('change.select2');

    // Tabla de insumos oculta
    activateType();

    // Activación tabla de consumos si el producto es compuesto
    $("[name='tipo']").click(function () {
        activateType();
    });

    // Tabla de insumos del producto
    var DataTableSupply = $('#dataTableSupply').DataTable({
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
                "width": "50%",
                "targets": 0
            }
            ,
            {
                "width": "30%",
                "targets": 1
            },
            {
                "width": "20%",
                "targets": 2
            }
        ],
        autoWidth: false,
        dom: "<'row'r>t<'row'r>",
        createdRow: function (row, data, dataIndex) { }
    });

    updateTable(DataTableSupply);

    // Lista de insumos
    let dataSupply = await main.consultar("idinsumo AS id, nombre AS text", "insumo", "estado = 'activo'");

    // Datos a Ingresar en la tabla de insumos
    selectSupply = '<select name="insumo_idinsumo" class="form-control insumo"><option value="" selected>Insumo...</option></select>';
    inputAmount = '<input class="form-control" type="number" min="1" name="cantidad">';
    buttons = "<span><center><button type='button' class='btnGuardarDV btn btn-primary btn-sm' title='Guardar' style='margin-right:5px'><i class='fas fa-save fa-xs'></i></button><button type='button' class='btn btn-danger btn-sm LimpiarDV' title='Eliminar'><i class='fas fa-eraser fa-xs'></i></button></center></span>";

    // Ingresar un nuevo insumo
    $("[id=newSupply]").on("click", function (e) {
        e.preventDefault();

        // Se deshabilita el boton para nuevos insumos mientras se guarda
        $(".newSupply").prop("disabled", true);

        // Se prepara los datos que se van a mostrar en la nueva fila
        var row = {
            0: selectSupply,
            1: inputAmount,
            2: buttons
        }

        // Se agregan los datos a la fila
        DataTableSupply.row.add(row).draw();

        // Select 2 para el select de insumos
        $(".insumo").select2({
            theme: "bootstrap",
            placeholder: "Insumo...",
            allowClear: true,
            data: dataSupply
        });
    });

    // Borrar filas
    $("[id=dataTableSupply]").on("click", ".LimpiarDV", function (e) {
        e.preventDefault();
        $(".newSupply").prop("disabled", false);
        if ($(this).val() != '') {
            arraySupply.splice($(this).val(), 1);
            arraySupply.sort();
        }
        updateTable(DataTableSupply);
    });

    // Guardar filas
    $("[id=dataTableSupply]").on("click", ".btnGuardarDV", function (e) {
        e.preventDefault();
        if ($("[name='insumo_idinsumo']").val() == '' || $("[name='cantidad']").val() == '') {
            main.showNotification('Llenar todos los campos', 'Error');
            return false;
        }

        // Datos del insumo
        var fila = {
            insumo_idinsumo: $("[name='insumo_idinsumo']").val(),
            insumo: $('select[name="insumo_idinsumo"] option:selected').text(),
            cantidad: parseFloat($("[name='cantidad']").val().trim())
        };

        // Se agregan los datos al arreglo de insumos
        arraySupply.push(fila);
        // Eliminar input
        $("[name='insumo_idinsumo']").remove();
        $("[name='cantidad']").remove();

        $(".newSupply").prop("disabled", false);
        updateTable(DataTableSupply);
    });

    $('#precio_venta').on('input', function () {
        let value = main.coin($(this).val());
        $(this).val(value);
    });

    $("form").on('submit', async function (e) {
        e.preventDefault();
        main.floatValue('precio_venta');
        const jsonData = main.serializeForm($("#form").serializeArray());
        if (typeof id !== 'undefined') {
            update = main.actualizar(table, jsonData, "id" + table + " = " + id);

            borrar = main.borrar('insumo_producto', 'producto_idproducto = ' + id);

            $.each(arraySupply, function () {
                const supply = {
                    producto_idproducto: id,
                    insumo_idinsumo: this.insumo_idinsumo,
                    cantidad: this.cantidad
                }

                insertSupply = main.insertar('insumo_producto', supply);
            });
        } else {
            if (fields.includes('estado')) {
                jsonData.estado = 'activo';
            }
            insert = main.insertar(table, jsonData);
            var dataInsert = await main.consultar("id" + table, table, "1 = 1 ORDER BY idproducto DESC");
            $.each(arraySupply, function () {
                const supply = {
                    producto_idproducto: dataInsert[0].idproducto,
                    insumo_idinsumo: this.insumo_idinsumo,
                    cantidad: this.cantidad
                }

                insertSupply = main.insertar('insumo_producto', supply);
            });
        }

        $('#Modal').modal('hide');
        main.showNotification('Guardado', '!');
        if (screen == 1) {
            setTimeout(function () { dataLoad(); }, 500);
        } else {
            setTimeout(function () { window.location.reload(); }, 500);
        }
    });
});

// Función para actualzar la tabla de insumos al guardar un insumo
function updateTable(DataTableSupply) {
    DataTableSupply.clear().draw();
    if (arraySupply.length > 0) {
        var filas = [];

        for (let i = 0; i < arraySupply.length; i++) {
            var fila = {
                0: arraySupply[i].insumo,
                1: arraySupply[i].cantidad,
                2: "<center><button type='button' class='btn btn-danger btn-sm LimpiarDV' value=" + i + " title='Eliminar'><i class='fas fa-eraser fa-xs'></i></button></center>"
            };
            filas.push(fila);
        }
        DataTableSupply.rows.add(filas).draw();
    }
}