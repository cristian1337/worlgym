table = 'gasto';

$(document).ready(async function () {
    let data = await main.consultar("idcategoria_gasto AS id, nombre AS text", "categoria_gasto", "estado = 'activo'");

    $("[name='categoria_gasto_idcategoria_gasto']").select2({
        theme: "bootstrap",
        placeholder: "Categoría...",
        allowClear: true,
        data: data
    });

    $("[name='categoria_gasto_idcategoria_gasto']").val('').trigger('change.select2');

    $("[name='fecha']").val(actualDate());

    $('#valor').on('input', function () {
        let value = main.coin($(this).val());
        $(this).val(value);
    });

    $("form").on('submit', function (e) {
        e.preventDefault();
        main.floatValue('valor');
        const jsonData = main.serializeForm($("#form").serializeArray());
        insert = main.insertar(table, jsonData);
        $('#Modal').modal('hide');
        main.showNotification('Guardado', '!');
        setTimeout(function () { window.location.reload(); }, 500);
     });
});