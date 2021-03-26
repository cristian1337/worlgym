const main = require('../../main.js');
window.onload = imprimir;

async function imprimir() {
    let datosEmpresa = await main.consultar("Valor", "Configuracion", "Nombre = 'empresa'");
    
    //Obtener parametros de la url
    const querystring = require('querystring');
    let query = querystring.parse(global.location.search);
    let data = JSON.parse(query['?data']);

    let products;
    if (data.tipo == 1) {
        products = await main.consultar("idProducto, Cantidad, ValorUnitario, Nombre, DATE_FORMAT(Fecha, '%Y-%m-%d') AS Fecha, ValorTotal", "Producto p, ProductosVenta pv, Venta v", "p.idProducto = pv.Producto_idProducto AND pv.Venta_idVenta = v.idVenta AND pv.Venta_idVenta= " + data.id);
    } else {
        products = await main.consultar("idProducto, Cantidad, ValorUnitario, Nombre, DATE_FORMAT(Fecha, '%Y-%m-%d') AS Fecha, ValorTotal", "Producto p, ProductosIngreso pv, Ingreso v", "p.idProducto = pv.Producto_idProducto AND pv.Ingreso_idIngreso = v.idIngreso AND pv.Ingreso_idIngreso= " + data.id);
    }

    var html = '';
    for (let i = 0; i < products.length; i++) {
        var total = products[i].Cantidad * products[i].ValorUnitario;
        html += '<tr>';
        html += '<td class="cantidad">' + products[i].Cantidad + '</td>';
        html += '<td class="producto">' + products[i].Nombre + '</td>';
        html += '<td class="precio">$ ' + coin(total.toString()) + '</td>';
        html += '</tr>';
    }

    listProducts = document.getElementById('products');
    listProducts.innerHTML = html;

    verTotal = document.getElementById('total');
    verTotal.innerHTML = '$ ' + coin(products[0].ValorTotal.toString());

    encabezado = document.getElementById('encabezado');
    encabezado.innerHTML = datosEmpresa[0].Valor + '<br>Santa Rosa de Cabal<br>' + products[0].Fecha;
    window.print();
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