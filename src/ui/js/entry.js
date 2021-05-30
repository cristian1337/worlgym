arrayProducts = [];
arrayAditionals = [];
table = 'ingreso';

$(document).ready(async function () {
    $("#fecha").val(main.actualDate());

    // Lista de Proveedores
    let dataSuppier = await main.consultar("idproveedor AS id, nombre AS text", "proveedor", "estado = 'activo' ORDER BY nombre ASC");
    $("[name='proveedor_idproveedor']").select2({
        theme: "bootstrap",
        placeholder: "Proveedor...",
        allowClear: true,
        data: dataSuppier
    });

    // Tabla de productos
    var dataTableProducts = $('#dataTableProducts').DataTable({
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

    // Lista de productos
    productList = [];
    let categories = await main.consultar("idcategoria AS id, nombre AS text", "categoria", "estado = 'activo' ORDER BY nombre ASC");
    var i = 0;
    for (const category of categories) {
        let Products = await main.consultar("idproducto AS id, nombre AS text", "producto", "tipo = 'simple' AND estado = 'activo' AND categoria_idcategoria = " + category.id + " ORDER BY nombre ASC");
        if (Products.length) {
            productList[i] = { "text": category.text, "element": "HTMLOptGroupElement" }
            productList[i].children = Products;
            i++;
        }
    }

    // Datos a Ingresar en la tabla de productos
    selectProducts = '<select name="producto_idproducto" class="form-control producto"><option value="" selected>Producto...</option></select>';
    inputAmount = '<input class="form-control" type="number" min="1" name="cantidad">';
    inputPrice = '<input class="form-control" style="width: 100px;" type="number" min="1000" name="precio">';
    buttons = "<span><center><button type='button' class='btnGuardarDV btn btn-primary btn-sm' title='Guardar' style='margin-right:5px'><i class='fas fa-save fa-xs'></i></button><button type='button' class='btn btn-danger btn-sm LimpiarDV' title='Eliminar'><i class='fas fa-eraser fa-xs'></i></button></center></span>";

    // Ingresar un nuevo producto
    $("[id=newProduct]").on("click", function (e) {
        e.preventDefault();

        // Se deshabilita el boton para nuevos insumos mientras se guarda
        $(".newProduct").prop("disabled", true);

        // Se prepara los datos que se van a mostrar en la nueva fila
        var row = {
            0: selectProducts,
            1: inputAmount,
            2: inputPrice,
            3: '',
            4: buttons
        }

        // Se agregan los datos a la fila
        dataTableProducts.row.add(row).draw();

        // Select 2 para el select de insumos
        $(".producto").select2({
            theme: "bootstrap",
            placeholder: "Producto...",
            allowClear: true,
            data: productList
        });
    });

    // Borrar filas producto
    $("[id=dataTableProducts]").on("click", ".LimpiarDV", function (e) {
        e.preventDefault();
        $(".newProduct").prop("disabled", false);
        if ($(this).val() != '') {
            arrayProducts.splice($(this).val(), 1);
            arrayProducts.sort();
        }
        updateTableProducts(dataTableProducts);
    });

    // Guardar filas producto
    $("[id=dataTableProducts]").on("click", ".btnGuardarDV", function (e) {
        e.preventDefault();
        if ($("[name='producto_idproducto']").val() == '' || $("[name='cantidad']").val() == '' || $("[name='precio']").val() == '') {
            main.showNotification('Llenar todos los campos', 'Error');
            return false;
        }

        // Datos del producto
        var fila = {
            producto_idproducto: $("[name='producto_idproducto']").val(),
            producto: $('select[name="producto_idproducto"] option:selected').text(),
            cantidad: parseFloat($("[name='cantidad']").val().trim()),
            precio: parseFloat($("[name='precio']").val().trim())
        };

        // Se agregan los datos al arreglo de productos
        arrayProducts.push(fila);
        // Eliminar input
        $("[name='producto_idproducto']").remove();
        $("[name='cantidad']").remove();
        $("[name='precio']").remove();

        $(".newProduct").prop("disabled", false);
        updateTableProducts(dataTableProducts);
    });

    // Tabla de adicionales
    var dataTableAditionals = $('#dataTableAditionals').DataTable({
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

    // Inputs para adicionales
    inputName = '<input class="form-control" type="text" name="nombre">';
    measureUnit = '<input class="form-control" type="text" name="unidad_medida">';

    // Ingresar un nuevo adicional
    $("[id=newSupplie]").on("click", function (e) {
        e.preventDefault();

        // Se deshabilita el boton para nuevos insumos mientras se guarda
        $(".newSupplie").prop("disabled", true);

        // Se prepara los datos que se van a mostrar en la nueva fila
        var row = {
            0: inputName,
            1: inputAmount,
            2: measureUnit,
            3: inputPrice,
            4: '',
            5: buttons
        }

        // Se agregan los datos a la fila
        dataTableAditionals.row.add(row).draw();
    });

    // Borrar filas adicionales
    $("[id=dataTableAditionals]").on("click", ".LimpiarDV", function (e) {
        e.preventDefault();
        $(".newSupplie").prop("disabled", false);
        if ($(this).val() != '') {
            arrayAditionals.splice($(this).val(), 1);
            arrayAditionals.sort();
        }
        updateTableAditionals(dataTableAditionals);
    });

    // Guardar filas adicionales
    $("[id=dataTableAditionals]").on("click", ".btnGuardarDV", function (e) {
        e.preventDefault();
        if ($("[name='nombre']").val() == '' || $("[name='cantidad']").val() == '' || $("[name='precio']").val() == '') {
            main.showNotification('Llenar todos los campos', 'Error');
            return false;
        }

        // Datos del producto
        var fila = {
            nombre: $("[name='nombre']").val(),
            unidad_medida: $("[name='unidad_medida']").val(),
            cantidad: parseFloat($("[name='cantidad']").val().trim()),
            precio: parseFloat($("[name='precio']").val().trim())
        };

        // Se agregan los datos al arreglo de productos
        arrayAditionals.push(fila);
        // Eliminar input
        $("[name='nombre']").remove();
        $("[name='cantidad']").remove();
        $("[name='precio']").remove();
        $("[name='unidad_medida']").remove();

        $(".newSupplie").prop("disabled", false);
        updateTableAditionals(dataTableAditionals);
    });

    $("form").on('submit', async function (e) {
        e.preventDefault();
        main.floatValue('valor');
        const jsonData = main.serializeForm($("#form").serializeArray());
        for (var clave in jsonData) {
            if (jsonData[clave] == "") {
                delete jsonData[clave];
            }
        }

        if (!jsonData.valor) {
            main.showNotification('No existen productos ni adicionales, por favor ingresarlos', '');
            return false;
        }

        insert = main.insertar('ingreso', jsonData);

        setTimeout(function () {
            insertId = localStorage.getItem('insertId');
            $.each(arrayProducts, async function () {
                const Product = {
                    ingreso_idingreso: insertId,
                    producto_idproducto: this.producto_idproducto,
                    valor_unitario: this.precio,
                    cantidad: this.cantidad
                }

                insertProduct = main.insertar('producto_ingreso', Product);

                actual = await main.consultar("stock", "producto", "idproducto = " + this.producto_idproducto);

                const UpdateCant = {
                    stock: actual[0].stock + this.cantidad
                }

                updateProd = main.actualizar('producto', UpdateCant, "idproducto = " + this.producto_idproducto);
            });

            $.each(arrayAditionals, function () {
                const Aditional = {
                    ingreso_idingreso: insertId,
                    nombre: this.nombre,
                    unidad_medida: this.unidad_medida,
                    cantidad: this.cantidad,
                    valor_unitario: this.precio
                }

                insertAditional = main.insertar('adicional_ingreso', Aditional);
            });

            $('#Modal').modal('hide');
            main.showNotification('Guardado', '!');
            setTimeout(function () { window.location.reload(); }, 500);
        }, 500);
    });
});

function totalPedido() {
    var suma = 0;

    $.each(arrayProducts, function () {
        suma += this.precio * this.cantidad;
    });

    $.each(arrayAditionals, function () {
        suma += this.precio * this.cantidad;
    });

    $("#valor").val(main.coin(suma.toString()));
}

// Función para actualzar la tabla de productos
function updateTableProducts(dataTableProducts) {
    dataTableProducts.clear().draw();
    if (arrayProducts.length > 0) {
        var filas = [];

        for (let i = 0; i < arrayProducts.length; i++) {
            total = arrayProducts[i].precio * arrayProducts[i].cantidad;
            var fila = {
                0: arrayProducts[i].producto,
                1: arrayProducts[i].cantidad,
                2: '$' + main.coin(arrayProducts[i].precio.toString()),
                3: '$' + main.coin(total.toString()),
                4: "<center><button type='button' class='btn btn-danger btn-sm LimpiarDV' value=" + i + " title='Eliminar'><i class='fas fa-eraser fa-xs'></i></button></center>"
            };
            filas.push(fila);
        }
        dataTableProducts.rows.add(filas).draw();
    }
    totalPedido();
}

// Función para actualzar la tabla de adicionales
function updateTableAditionals(dataTableAditionals) {
    dataTableAditionals.clear().draw();
    if (arrayAditionals.length > 0) {
        var filas = [];

        for (let i = 0; i < arrayAditionals.length; i++) {
            total = arrayAditionals[i].precio * arrayAditionals[i].cantidad;
            var fila = {
                0: arrayAditionals[i].nombre,
                1: arrayAditionals[i].cantidad,
                2: arrayAditionals[i].unidad_medida,
                3: '$' + main.coin(arrayAditionals[i].precio.toString()),
                4: '$' + main.coin(total.toString()),
                5: "<center><button type='button' class='btn btn-danger btn-sm LimpiarDV' value=" + i + " title='Eliminar'><i class='fas fa-eraser fa-xs'></i></button></center>"
            };
            filas.push(fila);
        }
        dataTableAditionals.rows.add(filas).draw();
    }
    totalPedido();
}