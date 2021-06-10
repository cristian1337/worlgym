$(document).ready(async function () {
    var tablesData = await main.consultar("idmesa, nombre", "mesa", "estado = 'activo' ORDER BY nombre ASC");

    var i = 0;
    var string = '';

    $.each(tablesData, function () {
        if (i == 0) {
            string += '<div class="row">';
        }

        // Datos de la mesa
        string += '<div class="col-xl-3 col-md-6 mb-4 mesas" idmesa="' + this.idmesa + '">';
        string += '<div class="card border-left-primary shadow h-100 py-2">';
        string += '<div class="card-body">';
        string += '<div class="row no-gutters align-items-center">';
        string += '<div class="col mr-2">';
        string += '<div class="h5 mb-0 font-weight-bold text-gray-800 row">';
        string += '<span class="col-md-4"></span>';
        string += '<span class="col-md-4"><i class="fas fa-chair fa-4x text-gray-300"></i></span>';
        string += '</div>';
        string += '<br>';
        string += '<div class="text-xl font-weight-bold text-primary text-uppercase mb-1 row">';
        string += '<span class="col-md-2"></span>';
        string += '<span class="col-md-7">' + this.nombre + '</span>';
        string += '<span class="badge badge-light btn btn-success" class="notify" id="notify_' + this.idmesa + '" style="display: none;">+1</span>';
        string += '</div>';
        string += '</div>';
        string += '</div>';
        string += '</div>';
        string += '</div>';
        string += '</div>';

        i += 1;
        if (i == 3) {
            string += '</div>';
            i = 0;
        }
    });
    if (i != 0) {
        string += '</div>';
    }

    $("#menu_mesas").append(string);

    $(".mesas").on('click', function() {
        localStorage.setItem('idmesa', $(this).attr('idmesa'));
        $("#Modal .modal-content").load('./pages/sale.html', async function () {
            $("#Modal").modal({
                backdrop: 'static',
                keyboard: true,
                show: true
            });
        });
    });
});