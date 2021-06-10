const main = require('../../main.js');
window.onload = imprimir;

async function imprimir() {
    let datosEmpresa = await main.consultar("valor", "configuracion", "nombre = 'empresa'");
    
    //Obtener parametros de la url
    const querystring = require('querystring');
    let query = querystring.parse(global.location.search);
    let data = JSON.parse(query['?data']);

    let products;
    products = await main.consultar("p.idproducto, pv.cantidad, pv.valor_unitario, p.nombre, DATE_FORMAT(fecha, '%Y-%m-%d') AS Fecha, v.valor", "producto p, producto_venta pv, venta v", "p.idproducto = pv.producto_idproducto AND pv.venta_idventa = v.idventa AND pv.venta_idventa = " + data.id);

    var html = '';
    for (let i = 0; i < products.length; i++) {
        var total = products[i].cantidad * products[i].valor_unitario;
        html += '<tr>';
        html += '<td class="cantidad">' + products[i].cantidad + '</td>';
        html += '<td class="producto">' + products[i].nombre + '</td>';
        html += '<td class="precio">$ ' + main.coin(total.toString()) + '</td>';
        html += '</tr>';
    }

    listProducts = document.getElementById('products');
    listProducts.innerHTML = html;

    verTotal = document.getElementById('total');
    verTotal.innerHTML = '$ ' + main.coin(products[0].valor.toString());

    encabezado = document.getElementById('encabezado');
    encabezado.innerHTML = datosEmpresa[0].valor + '<br>Santa Rosa de Cabal<br>' + products[0].Fecha;
    window.print();
}