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
    order: [1, 'desc'],

    createdRow: function (row, data, dataIndex) {
        $(row).on("click", ".viewProducts", function (e) {
            e.preventDefault();
            list(data[0]);
        });
    }
});

cargarSales();

async function cargarSales() {
    let saleData = await main.consultar("idVenta, DATE_FORMAT(Fecha, '%Y-%m-%d') AS Fecha, ValorTotal", "Venta", "");
    var filas = [];
    $.each(saleData, function () {
        viewProducts = '<button class="viewProducts btn btn-info btn-xs" title="Ver" style="margin-bottom:3px; margin: 0px 0px 0px 6px;"><i class="fas fas-xs fa-eye"></i></button>';

        var fila = {
            0: this.idVenta,
            1: this.Fecha,
            2: coin(this.ValorTotal.toString()),
            3: viewProducts,
        }
        filas.push(fila);
    });
    DTtblCtg.clear().draw();
    DTtblCtg.rows.add(filas).draw();
}

function loadProducts(products, DTtblProds) {
    var filas = [];
    $.each(products, function () {
        var total = this.Cantidad * this.ValorUnitario;
        var fila = {
            0: this.idProducto,
            1: this.Nombre,
            2: this.Cantidad,
            3: coin(this.ValorUnitario.toString()),
            4: coin(total.toString()),
        }
        filas.push(fila);
    });
    DTtblProds.clear().draw();
    DTtblProds.rows.add(filas).draw();
}

function list(id) {
    $("#Modal .modal-content").load('./pages/productsList.html', async function () {
        $("#Modal").modal({
            backdrop: 'static',
            keyboard: true,
            show: true
        });

        let productsSale = await main.consultar("idProducto, Cantidad, ValorUnitario, Nombre, DATE_FORMAT(Fecha, '%Y-%m-%d') AS Fecha, ValorTotal", "Producto p, ProductosVenta pv, Venta v", "p.idProducto = pv.Producto_idProducto AND pv.Venta_idVenta = v.idVenta AND pv.Venta_idVenta= " + id);
        
        $("#fecha").val(productsSale[0].Fecha);
        $("#valor_total").val(coin(productsSale[0].ValorTotal.toString()));

        var DTtblProds = $('#dataTableProducts').DataTable({
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

            }
        });

        loadProducts(productsSale, DTtblProds);

        //Imprimir
        const electron = require('electron') 
        // Importing BrowserWindow from Main 
        const BrowserWindow = electron.remote.BrowserWindow;

        var current = document.getElementById('current');
        var options = {
            silent: false,
            printBackground: true,
            color: false,
            margin: {
                marginType: 'printableArea'
            },
            landscape: false,
            pagesPerSheet: 1,
            collate: false,
            copies: 1,
            header: 'Header of the Page',
            footer: 'Footer of the Page'
        }

        current.addEventListener('click', (event) => {
            let window;
            data = {"tipo": 1, "id": id}
            window = newWindowImprimir('src/ui/pages/factura.html', 220, 400, window, data);
            window.on('shown', () => { window.focus() }); window.show();
            let win = BrowserWindow.getFocusedWindow();
        });

        function newWindowImprimir(location, wt = 1200, ht = 1000, window, data = {}) {
            window = new BrowserWindow({
                width: wt,
                height: ht,
                webPreferences: {
                    nodeIntegration: true,
                    enableRemoteModule: true
                }
            })
            window.loadFile(location, {query: {"data": JSON.stringify(data)}});
            return window;
        };

    });
}

function convertToInteger(value) {
    var i = value.replace(/\./g, '').indexOf(',');
    value = value.replace(/[^0-9]/g, '');
    return i != -1 ? value.slice(0, i) + ',' + value.slice(i) : value;
}

function coin(value) {
    value = convertToInteger(value);

    var parts = value.split(',');
    var integer = parts[0].replace(/\./g, '');
    var finish = new Array();

    for (var i = parts[0].length - 1; i >= 0; i--)
        finish.unshift((!((finish.length + 1) % 3) && i ? '.' : '') + parts[0][i]);

    integer = finish.join('');

    return value.indexOf(',') != -1 ? integer + ',' + parts[1] : integer;
}

