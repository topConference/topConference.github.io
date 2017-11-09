// const mustache = require('mustache');

const $confs = $('#confs');
const confTemplate = $('#confTemplate').html();
const $searchInput = $('#searchInput');
let removeConf = () => {
    $confs.html('');
}

let addConf = (conf) => {
    $confs.append(Mustache.render(confTemplate, conf));
}
let searchConf = (input) => {
    // console.log("sea");
    let t = input.trim();
    $('.conf').each((i, a) => {
        if (
            $(a).attr('data-topic').indexOf(t) != -1
            || $(a).attr('data-deadline').indexOf(t) != -1
            || $(a).attr('data-url').indexOf(t) != -1
            || $(a).attr('data-address').indexOf(t) != -1
            || $(a).attr('data-img').indexOf(t) != -1
            || $(a).attr('data-h5index').indexOf(t) != -1
            || $(a).attr('data-end_date').indexOf(t) != -1
            || $(a).attr('data-start_date').indexOf(t) != -1) {
            $(a).removeClass("d-none");
            // console.log('show');
        } else {
            $(a).addClass("d-none");
            // console.log('hide');
        }
    })
}
let getConf = () => {
    $.ajax({
        url: 'http://localhost:8080/api/conf',
        type: 'get',
        success: (result) => {
            removeConf();
            let confs = result.conferences;
            // console.log(confs);
            $.each(confs, function (i, conf) {
                addConf(conf);
            });
        },
        error: function () {
            myAlert($('#loadConfError'));
        }
    });
}

let myAlert= (alert) =>{
    alert.delay(100).fadeIn(300).delay(3000).fadeOut(300);
}

getConf();
$searchInput.on("keyup", function (e) {
    clearTimeout($.data(this, 'timer'));
    if (e.keyCode === 13)
        searchConf($(this).val());
    else
        $(this).data('timer', setTimeout(function () {
            searchConf($searchInput.val());
        }, 200));
});