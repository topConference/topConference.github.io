const CLIENT_ID = '990871840937-pmo8nnnoahejqsnkp6rvkbsbiqbik0g1.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCEv9sqIJw-j0HCrp8RN-76zIEaGPJi2uQ';
// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/calendar";
const $addCalBtn = $('#addCalBtn');
// const signoutButton = document.getElementById('signout-button');
// console.log(authorizeButton);
/**
 *  Sign in the user upon button click.
 */
const handleAuthClick = (event) => {
    gapi.auth2.getAuthInstance().signIn();
}

let googleLogIn = false;
let geocoder;
let map;
/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
const updateSigninStatus = (isSignedIn) => {
    $addCalBtn.removeAttr('disabled');
    if (isSignedIn) {
        googleLogIn = true;
        $addCalBtn.text(' add to calendar');
        $addCalBtn.removeClass('fa-google');
        $addCalBtn.addClass('fa-calendar');
    } else {
        googleLogIn = false;
        $addCalBtn.text(' sign in google calerdar');
        $addCalBtn.addClass('fa-google');
        $addCalBtn.removeClass('fa-calendar');
    }
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: {
            lat: -34.397,
            lng: 150.644
        }
    });
    geocoder = new google.maps.Geocoder();
    console.log(geocoder);
}

const initClient = () => {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(() => {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
}
const handleClientLoad = () => {
    gapi.load('client:auth2', initClient);
}

//disable scrollbar
// $("body").css("overflow", "auto");
//on ready
$(function () {
    const today = new Date();
    // const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    handleClientLoad();
    initMap();
    const $confModal = $('#confModal');
    let $target;
    let user = {};
    let userInfo = {};
    const deadlineLimit = '20171206';
    const $noConf = $('#noConf');
    const $primaryAlert = $('#primaryAlert');
    const $dangerAlert = $('#dangerAlert');
    const $infoAlert = $('#infoAlert');
    const $confs = $('#confs');
    const confTemplate = $('#confTemplate').html();
    const $searchInput = $('#searchInput');
    const $logInUsername = $('#logInUsername');
    const $logInPassword = $('#logInPassword');
    const $myConfs = $('#myConfs');
    const myConfTemplate = $('#myConfTemplate').html();
    const $mySearchInput = $('#mySearchInput');
    const $logInBtn = $('#logInBtn');
    const $logInForm = $('#logInForm');
    const $signUpForm = $('#signUpForm');
    const $addBtn = $('#addBtn');
    const $addCalBtn = $('#addCalBtn');
    const $delBtn = $('#delBtn');
    const $updateBtn = $('#updateBtn');
    const $logOutBtn = $('#logOutBtn');
    //google-map

    const geocodeAddress = (geocoder, resultsMap, address) => {
        geocoder.geocode({
            'address': address
        }, function (results, status) {
            if (status === 'OK') {
                resultsMap.setCenter(results[0].geometry.location);
                let marker = new google.maps.Marker({
                    map: resultsMap,
                    position: results[0].geometry.location
                });
            } else {
                console.log('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    $('#confs').delegate('.address', 'mouseover', (e) => {
        let address = $(e.target).text();
        geocodeAddress(geocoder, map, address);
    });
    $('#myConfs').delegate('.address', 'mouseover', (e) => {
        let address = $(e.target).text();
        geocodeAddress(geocoder, map, address);
    });
    const myAddConf = (conf) => {
        $noConf.addClass('d-none');
        let deadline = conf['deadline'];
        let start_date = conf['start_date'];
        let end_date = conf['end_date'];
        let d = new Date(deadline.slice(0, 4), deadline.slice(4, 6) - 1, deadline.slice(6));
        let s = new Date(start_date.slice(0, 4), start_date.slice(4, 6) - 1, start_date.slice(6));
        let e = new Date(end_date.slice(0, 4), end_date.slice(4, 6) - 1, end_date.slice(6));
        let delta1 = Math.ceil((d.getTime() - today.getTime()) / (1000 * 3600 * 24));
        let delta2 = Math.ceil((s.getTime() - today.getTime()) / (1000 * 3600 * 24));
        let delta3 = Math.ceil((e.getTime() - today.getTime()) / (1000 * 3600 * 24));
        conf['deadline2'] = undefined;
        if (delta1 > 0 && delta1 < 30) {
            conf['deadline2'] = delta1 + " days left for submission";
        } else if (delta2 > 0 && delta2 < 30)
            conf['deadline2'] = delta2 + " days left for open";
        $myConfs.append(Mustache.render(myConfTemplate, conf));
    }
    const getUser = () => {
        $.ajax({
            url: `http://do1.bilabila.tk:3000/api/users/${user.userId}?access_token=${user.id}`,
            type: 'get',
            success: (r) => {
                userInfo = r;
                $logOutBtn.removeClass('d-none');
                $logInForm.addClass('d-none');
                if (userInfo['conferences'] === undefined || userInfo['conferences'].length === 0) {
                    $noConf.removeClass('d-none');
                } else {
                    $.each(r.conferences, (i, conf) => {
                        console.log(conf);
                        myAddConf(conf);
                    });
                }
            },
            error: (e) => {
                console.log(e);
            }
        });
    };

    const removeConf = () => {
        $confs.html('');
    }

    const addConf = (conf) => {
        if (conf['deadline'] > deadlineLimit)
            $confs.append(Mustache.render(confTemplate, conf));
    }

    const searchMyConf = (input) => {
        let t = input.trim().toLowerCase();
        $('#rightDiv .conf').each((i, a) => {
            if (
                $(a).attr('data-topic').toLowerCase().indexOf(t) != -1 ||
                $(a).attr('data-deadline').indexOf(t) != -1 ||
                // $(a).attr('data-url').indexOf(t) != -1 ||
                $(a).attr('data-address').toLowerCase().indexOf(t) != -1 ||
                $(a).attr('data-img').toLowerCase().indexOf(t) != -1 ||
                // $(a).attr('data-h5index').indexOf(t) != -1 ||
                $(a).attr('data-end_date').indexOf(t) != -1 ||
                $(a).attr('data-start_date').indexOf(t) != -1) {
                $(a).removeClass("d-none");
            } else {
                $(a).addClass("d-none");
            }
        })
    }
    const searchConf = (input) => {
        // console.log("sea");
        $('body,html').scrollTop(0);
        let t = input.trim().toLowerCase();
        $('#leftDiv .conf').each((i, a) => {
            if (
                $(a).attr('data-topic').toLowerCase().indexOf(t) != -1 ||
                $(a).attr('data-deadline').indexOf(t) != -1 ||
                // $(a).attr('data-url').indexOf(t) != -1 ||
                $(a).attr('data-address').toLowerCase().indexOf(t) != -1 ||
                $(a).attr('data-img').toLowerCase().indexOf(t) != -1 ||
                // $(a).attr('data-h5index').indexOf(t) != -1 ||
                $(a).attr('data-end_date').indexOf(t) != -1 ||
                $(a).attr('data-start_date').indexOf(t) != -1) {
                $(a).removeClass("d-none");
            } else {
                $(a).addClass("d-none");
            }
        })
    }

    const getConf = () => {
        $.ajax({
            // url: 'http://do1.bilabila.tk:3000/api/conferences?filter[fields][info]&filter[top_info]&filter[limit]=10&filter[skip]=0',
            // url: 'http://do1.bilabila.tk:3000/api/conferences?filter[order]=topic&filter[fields][info]&filter[fields][top_info]',
            url: 'http://do1.bilabila.tk:3000/api/conferences?filter[order]=deadline&filter[fields][info]&filter[fields][top_info]',
            type: 'get',
            success: (result) => {
                removeConf();
                let confs = result;
                $.each(confs, function (i, conf) {
                    addConf(conf);
                });
                localStorage.setItem('conf', JSON.stringify(confs));
                localStorage.setItem('version', JSON.stringify(curVersion));
            },
            error: function () {
                console.log("error load confs");
                // myAlert($('#loadConfError'));
            }
        });
    }

    const login = (data) => {
        $.ajax({
            url: 'http://do1.bilabila.tk:3000/api/users/login',
            type: 'post',
            data: data,
            datatype: 'json',
            success: (res) => {
                user = res;
                console.log(res);
                localStorage.setItem('user', JSON.stringify(user));
                getUser();
            },
            error: (res) => {
                $dangerAlert.text(JSON.parse(res.responseText).error.message);
                myAlert($dangerAlert);
            }
        });
    }
    let userString = localStorage.getItem('user');
    if (userString != null) {
        user = JSON.parse(userString);
        getUser(user);
    } else {
        $logInForm.removeClass('d-none');
    }
    let confString = localStorage.getItem('conf');
    let cachedVersion = localStorage.getItem('version');
    const curVersion = $('#version').data('version');
    // cachedVersion = 0;
    if (confString != null && cachedVersion == curVersion) {
        removeConf();
        let confs = JSON.parse(confString);
        $.each(confs, function (i, conf) {
            addConf(conf);
        });
        console.log('use cached confs')
    } else {
        console.log('get remote confs')
        getConf();
    }


    const myAlert = (alert) => {
        alert.delay(100).fadeIn(300).delay(3000).fadeOut(300);
    }

    //add delete update ajax
    const patchConf = () => $.ajax({
        type: 'patch',
        data: {
            // conferences: userInfo['conferences']
            conferences: userInfo['conferences']
        },
        url: `http://do1.bilabila.tk:3000/api/users/${user.userId}?access_token=${user.id}`,
    });

    //add to my conferences
    const addToConf = (data) => {
        if (data === undefined) {
            data = {};
        }
        if (!('conferences' in userInfo)) {
            userInfo['conferences'] = [];
        }
        if (!data['topic']) {
            data['topic'] = "my conference";
        }
        userInfo.conferences.push(data);
        //to do may be need to delete some key;
        console.log(data);
        patchConf().done((r) => {
            myAddConf(data);
            console.log(r);
            $infoAlert.text('add success')
            myAlert($('#infoAlert'));
        }).fail((e) => {
            $dangerAlert.text('add failed')
            myAlert($('#dangerAlert'));
        });
    }

    //show map when hover in confs
    $confs.delegate('.address', 'mouseover', (e) => {
        let address = $(e.target).text();
        geocodeAddress(geocoder, map, address);
    });

    //log in  & sign up
    $logInForm.on('submit', (e) => {
        e.preventDefault();
        if ($logInBtn.html().indexOf("sign up") != -1 && $(this).find('.email').val().length === 0) {
            $dangerAlert.text('email is required');
            myAlert($dangerAlert);
        } else if ($(this).find('.username').val().length === 0) {
            $dangerAlert.text('username is required');
            myAlert($dangerAlert);
        } else if ($(this).find('.password').val().length === 0) {
            $dangerAlert.text('password is required');
            myAlert($dangerAlert);
        } else if ($logInBtn.html().indexOf("sign up") != -1) {
            let data = {
                'email': $(this).find('.email').val(),
                'username': $(this).find('.username').val(),
                'password': $(this).find('.password').val()
            };
            $.ajax({
                url: 'http://do1.bilabila.tk:3000/api/users',
                datatype: 'json',
                type: 'post',
                data: data,
                success: (res) => {
                    login(data);
                },
                error: (res) => {
                    $dangerAlert.text(JSON.parse(res.responseText).error.message);
                    myAlert($dangerAlert);
                }
            });
        } else {
            let data = {
                'username': $(this).find('.username').val(),
                'password': $(this).find('.password').val()
            };
            login(data);
        }
    })
    //clear data in modal
    const clearModalData = (modal) => {
        let data = {
            'topic': '',
            'address': '',
            'deadline': '',
            'start_date': '',
            'end_date': '',
            'url': '',
            'remark': ''
        }
        setModalData(data)
    }
    const setModalData = (data) => {
        $confModal.find('input.topic').val(data['topic']);
        $confModal.find('input.address').val(data['address']);
        $confModal.find('input.deadline').val(data['deadline']);
        $confModal.find('input.start_date').val(data['start_date']);
        $confModal.find('input.end_date').val(data['end_date']);
        $confModal.find('input.url').val(data['url']);
        $confModal.find('textarea').val('');
        $confModal.find('h5.modal-title').html(data['topic']);
    }
    // todo add to cal
    const addToCal = (data) => { }

    //search in all conferences
    $searchInput.on("keyup", (e) => {
        clearTimeout($.data(this, 'timer'));

        if (e.keyCode === 13) {
            searchConf($searchInput.val());
        }
        else
            $(this).data('timer', setTimeout(() => {
                searchConf($searchInput.val());
            }, 200));
    });

    $mySearchInput.on("keyup", function (e) {
        clearTimeout($.data(this, 'timer'));
        if (e.keyCode === 13)
            searchMyConf($(this).val());
        else
            $(this).data('timer', setTimeout(() => {
                searchMyConf($mySearchInput.val());
            }, 200));
    });

    //collapse listener not work |who  add a low level jquery!?| todo
    $('#toggleBtn').on('click', () => {
        if ($logInBtn.html().indexOf("sign up") != -1) {
            $logInBtn.html('log in <i class="fa fa-sign-in"/>');
        } else {
            $logInBtn.html('sign up <i class="fa fa-user-plus"/>');
        }
    })

    const getModalData = (modal) => {
        let data = {
            'topic': modal.find('input.topic').val(),
            'address': modal.find('input.address').val(),
            'deadline': modal.find('input.deadline').val(),
            'start_date': modal.find('input.start_date').val(),
            'end_date': modal.find('input.end_date').val(),
            'url': modal.find('input.url').val(),
            'remark': modal.find('textarea').val()
        };
        return data;
    }
    $confModal.on('show.bs.modal', (e) => {
        $delBtn.addClass('d-none');
        $updateBtn.addClass('d-none');
        $addCalBtn.removeClass('d-none');
        $addBtn.removeClass('d-none');
        $target = $(e.relatedTarget.closest('.conference'));
        if ($(e.relatedTarget).attr('id') === "addMyConfBtn") {
            clearModalData();
            if ($.isEmptyObject(userInfo)) {
                $addBtn.addClass('d-none');
            }
        } else {
            $confModal.find('input.topic').val($target.data('topic'));
            $confModal.find('input.address').val($target.data('address'));
            $confModal.find('input.deadline').val($target.data('deadline'));
            $confModal.find('input.start_date').val($target.data('start_date'));
            $confModal.find('input.end_date').val($target.data('end_date'));
            $confModal.find('input.url').val($target.data('url'));
            // $confModal.find('input.url').val($target.data('url'));
            $confModal.find('textarea').val('');
            $confModal.find('h5.modal-title').html($target.data('topic'));
            if ($target.hasClass('myConf')) {
                $confModal.find('textarea').val($target.data('remark'));
                $addBtn.addClass('d-none');
                $updateBtn.removeClass('d-none');
                $delBtn.removeClass('d-none');
            }
        }

    });

    //delete my conf
    const findAndRemove = (array, property, value) => {
        console.log(array, property, value);
        array.forEach(function (result, index) {
            if (result[property] == value) {
                array.splice(index, 1);
            }
        });
    }

    const findAndUpdate = (array, property, value, data) => {
        console.log(array, property, value);
        array.forEach(function (result, index) {
            if (result[property] == value) {
                array.splice(index, 1, data);
            }
        });
    }

    $confModal.delegate('.delete', 'click', () => {
        findAndRemove(userInfo['conferences'], 'topic', $target.data('topic'));
        console.log(userInfo['conferences']);
        // console.log($target.data('topic'));
        patchConf().done(() => {
            // console.log(userInfo['conferences']);
            $target.addClass('d-none');
            if (userInfo['conferences'] === undefined || userInfo['conferences'].length === 0)
                $noConf.removeClass('d-none');
            $infoAlert.text('del success');
            myAlert($infoAlert);
        }).fail(() => {
            $dangerAlert.text('del fail');
            myAlert($dangerAlert);
        });
    });

    $confModal.delegate('.add', 'click', function () {
        addToConf(getModalData($confModal));
    });
    $confModal.delegate('.add-to-cal', 'click', function () {
        addToCal(getModalData($confModal));
    });
    $confModal.delegate('.update', 'click', function () {
        findAndUpdate(userInfo['conferences'], 'topic', $target.data('topic'), getModalData($confModal));
        patchConf().done(() => {
            data = getModalData($confModal);
            $target.data(data);
            $target.find('.topic').html(data['topic']);
            $target.find('.address').html(data['address']);
            $infoAlert.text('update success');
            myAlert($infoAlert);
        }).fail(() => {
            $dangerAlert.text('update fail');
            myAlert($dangerAlert);
        });
    });

    //google cal
    const $calAlert = $('#calAlert');

    $addCalBtn.on('click', () => {
        if (!googleLogIn)
            handleAuthClick();
        else {
            let conf = getModalData($confModal);
            // console.log(conf);
            let start_date = conf['start_date'].toString();
            let end_date = conf['end_date'].toString();
            let topic = conf['topic'].toString();
            let summary = conf['topic'].toString();
            let pos = summary.indexOf(':');
            if (pos != -1) summary = summary.slice(0, pos - 1);
            let event = {
                'summary': summary,
                'location': conf['address'],
                'description': `${topic}
${conf['remark']}`,
                'start': {
                    // 'dateTime': '2015-05-28T09:00:00-07:00',
                    //todo timezone?
                    'dateTime': new Date(start_date.slice(0, 4), start_date.slice(4, 6) - 1, start_date.slice(6)),
                    'timeZone': 'America/Los_Angeles'
                },
                'end': {
                    //todo maybe to 24:24?
                    'dateTime': new Date(end_date.slice(0, 4), end_date.slice(4, 6) - 1, end_date.slice(6)),
                    'timeZone': 'America/Los_Angeles'
                },
                // 'recurrence': [
                //     'RRULE:FREQ=DAILY;COUNT=2'
                // ],
                // 'attendees': [{
                //         'email': 'lpage@example.com'
                //     },
                //     {
                //         'email': 'sbrin@example.com'
                //     }
                // ],
                'reminders': {
                    'useDefault': false,
                    'overrides': [{
                        'method': 'email',
                        'minutes': 24 * 60
                    },
                    {
                        'method': 'popup',
                        'minutes': 10
                    }
                    ]
                }
            };
            console.log(event);
            let request = gapi.client.calendar.events.insert({
                'calendarId': 'primary',
                'resource': event
            });
            request.execute((e) => {
                $calAlert.html(`<a href="${e.htmlLink}" target="_blank">click to see new event!</a>`);
                myAlert($calAlert);
            });
        }
    });

    //modal
    $('#confs').on('click', (e) => {
        let target = $(e.target);
        if (target.is('a') || target.hasClass('trigger')) return;
        if (target.hasClass('address')) {
            $searchInput.val(target.html());
            searchConf(target.html());
        } else if (target.is('img')) {
            let t = target.attr('src');
            let p = t.split(/[\/._]/);
            t = p[p.length - 3];
            $searchInput.val(t);
            searchConf(t);
        } else
            target.closest('.conference').find('.trigger').trigger('click');
    });
    //signout
    $logOutBtn.on('click', () => {
        localStorage.removeItem('user');
        window.location.reload();
    });


    //back to top
    var $backToTop = $('#back-to-top');
    $(window).scroll(() => {
        if ($(window).scrollTop() > 1000) {
            $backToTop.fadeIn(500);
        } else {
            $backToTop.removeClass('d-none');
            $backToTop.fadeOut(500);
        }
    });

    $backToTop.click(() => {
        $('body,html').animate({
            scrollTop: 0
        });
    });
})
