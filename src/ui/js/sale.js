arrayProducts = [];
id = 0;
idmesa = 0;
//Imprimir
var electron = require('electron');
var BrowserWindow = electron.remote.BrowserWindow;

$(document).ready(async function () {
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
        createdRow: function (row, data, dataIndex) {}
    });

    idmesa = localStorage.getItem('idmesa');

    if (idmesa != 0) {
        // Venta pendiente de facturar
        localStorage.setItem('idmesa', 0);
        var saleData = await main.consultar("v.idventa, DATE_FORMAT(v.fecha, '%Y-%m-%d') AS fecha, pv.producto_idproducto, p.nombre AS producto, pv.cantidad, pv.valor_unitario", "venta v, producto_venta pv, producto p", "v.idventa = pv.venta_idventa AND pv.producto_idproducto = p.idproducto AND v.estado = 'pendiente' AND v.mesa_idmesa = " + idmesa + " ORDER BY v.idventa DESC");

        if (saleData.length) {
            $("#fecha").val(saleData[0].fecha);
            id = saleData[0].idventa;
        } else {
            $("#fecha").val(main.actualDate());
        }

        $("#mesa_idmesa").val(idmesa);
        $("#estado").val('pendiente');
        $("#tipo").val('mesa');

        $.each(saleData, function () {
            // Datos del producto
            var fila = {
                producto_idproducto: this.producto_idproducto,
                producto: this.producto,
                cantidad: this.cantidad,
                precio: this.valor_unitario
            };

            // Se agregan los datos al arreglo de insumos
            arrayProducts.push(fila);
        });

        updateTableProducts(dataTableProducts);
    } else {
        // Nueva venta para la mesa
        $("#fecha").val(main.actualDate());
    }

    // Lista de productos
    productList = [];
    let categories = await main.consultar("idcategoria AS id, nombre AS text", "categoria", "estado = 'activo' ORDER BY nombre ASC");
    var i = 0;
    for (const category of categories) {
        let Products = await main.consultar("idproducto AS id, nombre AS text", "producto", "estado = 'activo' AND categoria_idcategoria = " + category.id + " ORDER BY nombre ASC");
        if (Products.length) {
            productList[i] = { "text": category.text, "element": "HTMLOptGroupElement" }
            productList[i].children = Products;
            i++;
        }
    }

    // Datos a Ingresar en la tabla de productos
    selectProducts = '<select name="producto_idproducto" class="form-control producto"><option value="" selected>Producto...</option></select>';
    inputAmount = '<input class="form-control cantidad" type="number" min="1" name="cantidad">';
    inputPrice = '<input class="form-control" style="width: 100px;" type="number" min="1000" name="precio">';
    buttons = "<span><center><button type='button' class='btnGuardarDV btn btn-primary btn-sm' title='Guardar' style='margin-right:5px'><i class='fas fa-save fa-sm'></i></button><button type='button' class='btn btn-danger btn-sm LimpiarDV' title='Eliminar'><i class='fas fa-eraser fa-sm'></i></button></center></span>";

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

        $("[name='producto_idproducto']").val('').trigger('change.select2');

        $('.producto').on('change', async function (e) {
            validarExistencias(1);
        });

        $(".cantidad").on('input', function() {
            validarExistencias(0);
        });
    });

    // Borrar filas producto
    $("[id=dataTableProducts]").on("click", ".LimpiarDV", function (e) {
        e.preventDefault();
        $(".newProduct").prop("disabled", false);
        if ($(this).val() != '') {
            actualizarStock(2, $(this).val());
            arrayProducts.splice($(this).val(), 1);
            arrayProducts.sort();
        }
        updateTableProducts(dataTableProducts);
    });

    // Guardar filas producto
    $("[id=dataTableProducts]").on("click", ".btnGuardarDV", function (e) {
        e.preventDefault();
        if ($("[name='producto_idproducto']").val() == '' || $("[name='cantidad']").val() == '' || $("[name='cantidad']").val() == 0 || $("[name='precio']").val() == '') {
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
        actualizarStock(1);
        // Eliminar input
        $("[name='producto_idproducto']").remove();
        $("[name='cantidad']").remove();
        $("[name='precio']").remove();

        $(".newProduct").prop("disabled", false);
        updateTableProducts(dataTableProducts);
    });

    // Validación botones a ocultar
    if ($("#mesa_idmesa").val() == '') {
        $("#guardar").parent().hide();
    }

    if ($("#estado").val() != 'pendiente') {
        $("#cerrar").parent().hide();
    }

    // Funciones de los botones

    // Submit para boton guardar
    $("form").on('submit', async function (e) {
        e.preventDefault();

        var jsonData = getDataForm();

        if (id != 0) {
            update = main.actualizar('venta', jsonData, "idventa = " + id);

            borrar = main.borrar('producto_venta', 'venta_idventa = ' + id);

            $.each(arrayProducts, async function () {
                var Product = {
                    venta_idventa: id,
                    producto_idproducto: this.producto_idproducto,
                    valor_unitario: this.precio,
                    cantidad: this.cantidad
                }
                insertProduct = main.insertar('producto_venta', Product);
            });

            $('#Modal').modal('hide');
            main.showNotification('Guardado', '!');
        } else {

            insert = main.insertar('venta', jsonData);

            setTimeout(function () {
                insertId = localStorage.getItem('insertId');
                $.each(arrayProducts, async function () {
                    var Product = {
                        venta_idventa: insertId,
                        producto_idproducto: this.producto_idproducto,
                        valor_unitario: this.precio,
                        cantidad: this.cantidad
                    }

                    insertProduct = main.insertar('producto_venta', Product);
                });
                $('#Modal').modal('hide');
                main.showNotification('Guardado', '!');
            }, 500);
        }
    });

    // Boton para cancelar la operación
    $("#cancelar").click(function () {
        $('#Modal').modal('hide');
    });

    $("#cerrar").click(function () {
        $("#estado").val('cerrado');

        var jsonData = getDataForm();

        if (id != 0) {
            update = main.actualizar('venta', jsonData, "idventa = " + id);

            borrar = main.borrar('producto_venta', 'venta_idventa = ' + id);

            $.each(arrayProducts, async function () {
                var Product = {
                    venta_idventa: id,
                    producto_idproducto: this.producto_idproducto,
                    valor_unitario: this.precio,
                    cantidad: this.cantidad
                }

                insertProduct = main.insertar('producto_venta', Product);
            });
        }
    });

    $("#facturar").click(function () {
        $("#estado").val('finalizado');

        var jsonData = getDataForm();

        if (id != 0) {
            update = main.actualizar('venta', jsonData, 'idventa = ' + id);

            borrar = main.borrar('producto_venta', 'venta_idventa = ' + id);

            $.each(arrayProducts, async function () {
                var Product = {
                    venta_idventa: id,
                    producto_idproducto: this.producto_idproducto,
                    valor_unitario: this.precio,
                    cantidad: this.cantidad
                }

                insertProduct = await main.insertar('producto_venta', Product);
            });

            $('#Modal').modal('hide');
            main.showNotification('Guardado', '!');
            var data = { "tipo": 1, "id": id }
            setTimeout(function () {
                imprimir(data);
            }, 500);
        } else {
            insert = main.insertar('venta', jsonData);

            setTimeout(function () {
                insertId = localStorage.getItem('insertId');
                $.each(arrayProducts, async function () {
                    var Product = {
                        venta_idventa: insertId,
                        producto_idproducto: this.producto_idproducto,
                        valor_unitario: this.precio,
                        cantidad: this.cantidad
                    }

                    insertProduct = main.insertar('producto_venta', Product);
                });
                $('#Modal').modal('hide');
                main.showNotification('Guardado', '!');
                var data = { "tipo": 1, "id": insertId }
                imprimir(data);
            }, 500);
        }
    });
});

async function actualizarStock(tipo = 1, posicion = 0) {
    if (tipo == 1) {
        var idproducto = $("[name='producto_idproducto']").val();
        var cantidad = parseFloat($("[name='cantidad']").val().trim());
    } else {
        var idproducto = arrayProducts[posicion].producto_idproducto;
        var cantidad = arrayProducts[posicion].cantidad;
    }
    
    var dataProduct = await main.consultar("tipo,stock", "producto", "idproducto = " + idproducto);

    if (dataProduct[0].tipo == 'simple') {
        if (tipo == 1) {
            const UpdateCant = {
                stock: dataProduct[0].stock - cantidad
            }
            updateProd = main.actualizar('producto', UpdateCant, "idproducto = " + idproducto);
        } else {
            const UpdateCant = {
                stock: dataProduct[0].stock + cantidad
            }
            updateProd = main.actualizar('producto', UpdateCant, "idproducto = " + idproducto);
        }
    } else {
        let dataSupply = await main.consultar("i.idinsumo, ip.cantidad, i.stock", 'insumo_producto ip, insumo i', "ip.insumo_idinsumo = i.idinsumo AND ip.producto_idproducto = " + idproducto);
        $.each(dataSupply, async function () {
            if (tipo == 1) {
                const UpdateCant = {
                    stock: this.stock - (cantidad * this.cantidad)
                }
                updateInsumo = await main.actualizar('insumo', UpdateCant, "idinsumo = " + this.idinsumo);
            } else {
                const UpdateCant = {
                    stock: this.stock + (cantidad * this.cantidad)
                }
                updateInsumo = await main.actualizar('insumo', UpdateCant, "idinsumo = " + this.idinsumo);
            }
        });
    }
}

async function validarExistencias(precio = 0) {
    var idproducto = $("[name='producto_idproducto']").val();
    var cantidad = parseFloat($("[name='cantidad']").val().trim());

    if (idproducto != '') {
        var dataProduct = await main.consultar("tipo,stock,precio_venta", "producto", "idproducto = " + idproducto);
        // console.log(dataProduct);
        if (precio == 1) {
            $("[name='precio']").val(dataProduct[0].precio_venta);    
        }
        
        if (dataProduct[0].tipo == 'simple') {
            if (cantidad > dataProduct[0].stock) {
                main.showNotification('Solo existe una disponibilidad total de ' + dataProduct[0].stock + ' para este producto.', '');
                $("[name='cantidad']").val(dataProduct[0].stock);
            }
        } else {
            let dataSupply = await main.consultar("i.idinsumo, ip.cantidad, i.stock, i.nombre", 'insumo_producto ip, insumo i', "ip.insumo_idinsumo = i.idinsumo AND ip.producto_idproducto = " + idproducto);
            $.each(dataSupply, function () {
                if ((cantidad * this.cantidad) > this.stock) {
                    main.showNotification('No existe disponibilidad del insumo ' + this.nombre + ' para la cantidad solicitada en el pedido.', '');
                    $("[name='cantidad']").val('');
                }
            });
        }
    }
}

function imprimir(data) {
    let windowFactura;
    windowFactura = newWindowImprimir('src/ui/pages/factura.html', 220, 400, windowFactura, data);
    windowFactura.on('shown', () => { windowFactura.focus() }); windowFactura.show();
    let win = BrowserWindow.getFocusedWindow();
}

function newWindowImprimir(location, wt = 1200, ht = 1000, windowFactura, data = {}) {
    windowFactura = new BrowserWindow({
        width: wt,
        height: ht,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    })
    windowFactura.loadFile(location, { query: { "data": JSON.stringify(data) } });
    return windowFactura;
}

function getDataForm() {
    main.floatValue('valor');
    let jsonData = main.serializeForm($("#form").serializeArray());
    for (var clave in jsonData) {
        if (jsonData[clave] == "") {
            delete jsonData[clave];
        }
    }

    if (!jsonData.valor) {
        main.showNotification('No existen productos, por favor ingresarlos', '');
        return false;
    } else {
        return jsonData;
    }
}

function totalPedido() {
    var suma = 0;
    $.each(arrayProducts, function () {
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
                4: "<center><button type='button' class='btn btn-danger btn-sm LimpiarDV' value=" + i + " title='Eliminar'><i class='fas fa-eraser fa-sm'></i></button></center>"
            };
            filas.push(fila);
        }
        dataTableProducts.rows.add(filas).draw();
    }
    totalPedido();
}