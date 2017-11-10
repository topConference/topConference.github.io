// const mustache = require('mustache');

const $confs = $('#confs');
const confTemplate = $('#confTemplate').html();
const $searchInput = $('#searchInput');

const $myConfs = $('#myConfs');
const myConfTemplate = $('#myConfTemplate').html();
const $mySearchInput = $('#mySearchInput');

const $signInForm = $('#signInForm');
const $signUpForm = $('#signUpForm');
let onSignIn = (googleUser) => {
    let profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
}

let signOut = () => {
    let auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
    });
}
$('#signOut').on('click', signOut);
// $('#signIn').on('click', onSignIn());


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

let myAlert = (alert) => {
    alert.delay(100).fadeIn(300).delay(3000).fadeOut(300);
}
getConf();
//add to my conferences
$confs.delegate('.add', 'click', function () {
    var conf = { 'conference.topic': $target.data('topic') };
    console.log("add to my confs");
    // $.ajax({
    //     type: 'DELETE',
    //     data: book,
    //     url: '/api/Book!delete',
    //     success: function () {
    //         myAlert($('#deleteBookSuccess'));
    //         $target.delay(300).fadeOut(500, function () {
    //             $(this).remove();
    //             console.log('delete on html');
    //         });
    //         console.log('is deleted?');
    //     },
    //     error: function () {
    //         myAlert($("#deleteBookError"));
    //     }
    // });
});
//show map when hover in confs
$confs.delegate('.address', 'mouseover', () => {
    console.log("address mouse over");
});
//show map when hover in myconfs
$myConfs.delegate('.address', 'mouseover', () => {
    console.log("myconfs address mouse over");
});
// delete my conference
$myConfs.delegate('.delete', 'click', () => {
    console.log("delete conf");
});
// delete my conference
$myConfs.delegate('.delete', 'click', () => {
    console.log("delete conf");
});

//signin
$signInForm.on('submit',(e)=>{
    e.preventDefault();
    let data = {
        'username': $signInForm.find('.username').val(),
        'password': $signInForm.find('.password').val(),
    };
    console.log(data);
    $.ajax({
        url: '/api/user',
        data: data,
        success: () => {
            //load my conferences
            // myAlert($('#addAuthorSuccess'));
        },
        error: () => {
            //user not exist
            //password error
            // myAlert($('#sign in error'));
        }
    });
})
//signup
//logout
//search in my conferences

//show and hide add button
$confs.delegate('.conf', 'mouseover', () => {
    console.log("conf mouse over");
    console.log($(this).find('.add'));
});
// $('.conf').delegate('mouseover', () => {
//     // $(this).find('.add').fadeIn(100);
//     console.log('mmm');
// });
//search in all conferences
$searchInput.on("keyup", function (e) {
    clearTimeout($.data(this, 'timer'));
    if (e.keyCode === 13)
        searchConf($(this).val());
    else
        $(this).data('timer', setTimeout(function () {
            searchConf($searchInput.val());
        }, 200));
});