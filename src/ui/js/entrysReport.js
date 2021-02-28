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

loadEntries();

async function loadEntries() {
    let entryData = await main.consultar("idIngreso, DATE_FORMAT(Fecha, '%Y-%m-%d') AS Fecha, ValorTotal, Proveedor_idProveedor", "Ingreso", "");
    var filas = [];
    for (const Entry of entryData) {
        viewProducts = '<button class="viewProducts btn btn-info btn-xs" title="Ver" style="margin-bottom:3px; margin: 0px 0px 0px 6px;"><i class="fas fas-xs fa-eye"></i></button>';
        let supplier = await main.consultar("Nombre", "Proveedor", "idProveedor = " + Entry.Proveedor_idProveedor);
        var fila = {
            0: Entry.idIngreso,
            1: Entry.Fecha,
            2: main.coin(Entry.ValorTotal.toString()),
            3: supplier[0].Nombre,
            4: viewProducts
        }
        filas.push(fila);
    }
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
            3: main.coin(this.ValorUnitario.toString()),
            4: main.coin(total.toString()),
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

        let productsSale = await main.consultar("idProducto, Cantidad, ValorUnitario, Nombre, DATE_FORMAT(Fecha, '%Y-%m-%d') AS Fecha, ValorTotal", "Producto p, ProductosIngreso pv, Ingreso v", "p.idProducto = pv.Producto_idProducto AND pv.Ingreso_idIngreso = v.idIngreso AND pv.Ingreso_idIngreso= " + id);

        $("#fecha").val(productsSale[0].Fecha);
        $("#valor_total").val(main.coin(productsSale[0].ValorTotal.toString()));

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
            var divContents = '<div class="form-group row"><label for="" class="col-sm-2 col-form-label">Fecha:</label>&nbsp;&nbsp;<label>' + productsSale[0].Fecha + '</label></div><br><br><table class="table table-striped table-bordered dt-responsive nowrap" id="dataTableProducts" width="100%" cellspacing="0" border="1">';
            divContents += document.getElementById("dataTableProducts").innerHTML;
            divContents += '</table><br><br><div class="form-group row"><label for="" class="col-sm-2 col-form-label">Total:</label>&nbsp;&nbsp;<label>' + main.coin(productsSale[0].ValorTotal.toString()) + '</label></div>';
            main.guardaTemporal('src/ui/pages/temporal.html', divContents);
            let window;
            window = new BrowserWindow({
                width: 1000,
                height: 800,
                webPreferences: {
                    nodeIntegration: true,
                    enableRemoteModule: true
                }
            })
            window.loadFile('src/ui/pages/temporal.html');
            window.on('shown', () => { window.focus() }); window.show();
            let win = BrowserWindow.getFocusedWindow();
            win.webContents.print(options, (success, failureReason) => {
                if (!success) console.log(failureReason);
                win.close();
                main.guardaTemporal('src/ui/pages/temporal.html', '');
            });
        });

    });
}