const { BrowserWindow } = require('electron');
//llamado conexion db
const { consulta, insert, update, deleteInfo } = require('./database');

function consultar(campos, tabla, where) {
    return consulta(campos, tabla, where);
}

function insertar(tabla, campos) {
    return insert(tabla, campos);
}

function actualizar(tabla, campos, condicion) {
    return update(tabla, campos, condicion);
}

function borrar(tabla, condicion) {
    return deleteInfo(tabla, condicion);
}

let windowNew;

function newWindow(location, wt = 1200, ht = 1000) {
    windowNew = new BrowserWindow({
        width: wt,
        height: ht,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    })
    windowNew.loadFile(location);
};

function showNotification(message = '', title = 'Basic Notification') {
    new Notification(
        title,
        {
            body: message,
            icon: './img/logo.png'
        }
    );
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

function floatValue(field) {
    var value = $("#" + field).val();
    value = value.replace(/\./g, '');
    value = value.replace(/\,/g, '.');
    $("#" + field).val(value);
}

function serializeForm(Form) {
    var FormObject = {};
    $.each(Form,
        function (i, v) {
            FormObject[v.name] = v.value;
        }
    );
    return FormObject;
}

function optionSelect2(field, value) {
    if ($('[name="' + field + '"]').hasClass("select2-hidden-accessible")) {
        $("[name='" + field + "']").val(value);
        $("[name='" + field + "']").trigger('change.select2');
    } else {
        setTimeout(function () { optionSelect2(field, value); }, 500);
    }
}

function actualDate() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

module.exports = {
    newWindow,
    consultar,
    insertar,
    showNotification,
    actualizar,
    coin,
    floatValue,
    serializeForm,
    optionSelect2,
    borrar,
    actualDate
};