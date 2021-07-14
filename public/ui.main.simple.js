// Muaz Khan         - www.MuazKhan.com
// MIT License       - www.WebRTC-Experiment.com/licence
// Experiments       - github.com/muaz-khan/WebRTC-Experiment

function getElement(selector) {
    return document.querySelector(selector);
}

var main = getElement('.main');
var userlist  = [];
var accesscount = 0;

function getUserInfo(_id){
    return userlist.find(user => user.id === _id);
}

function updateUserlist(){
    $('#user-list').empty();
    $('#user-list').append('<div class="my-2"><b>접속된 사용자 목록 ('+userlist.length+' 명)</b></div>');
    userlist.forEach(user=>{
        $('#user-list').append('<div class="my-1" style="color : '+user.color+';">😀 &nbsp;'+user.id+'</div>');
    });
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

function addNewMessage(args) {
    
    
    if(args.message.includes('left the room.')){
        var delUser = userlist.find(user=> user.id === args.header);
        var delUserIdx = userlist.indexOf(delUser);

        if(delUserIdx === -1){
            return;
        }

        console.log(delUser);
        var iframe = document.getElementById('vr360_player_area').contentWindow; 
        iframe.postMessage({ parentData : 'removeClient' , imm: false , userinfo: delUser},'*');

        console.log('delete user idx ' + delUserIdx);
        userlist.splice(delUserIdx, 1);
        
        
        updateUserlist();
    }
    if(args.message.includes('Data connection is opened between you and')){
        console.log('Data connection');
        // $('#user-list').append('<div class="my-1">😀 &nbsp;'+args.header+'</div>');
        if(accesscount % 2 == 1) {
            var guestUser = {
                id: args.header,
                color : '#0000ff',
                hotspot : '/public/rtc/user_view_blue.png'
            }
            userlist.push(guestUser);
        }
        else{
            var guestUser = {
                id: args.header,
                color : '#00ff00',
                hotspot : '/public/rtc/user_view_green.png'
            }
            userlist.push(guestUser);
        }
        accesscount = accesscount +1;
        updateUserlist();
    }

    if(args.message.includes('clientLookAt')){
        // var iframe = document.getElementById('vr360_player_area').contentWindow; 
        // iframe.postMessage({ parentData : 'getL'},'*');
        if(rtcMultiConnection.mode !== 'host') return;

        var lookAtDeg = JSON.parse(args.message.split('||')[1]);
        // console.log(lookAtDeg);
        var iframe = document.getElementById('vr360_player_area').contentWindow; 
        iframe.postMessage({ parentData : 'clientLookAt' , hDeg: lookAtDeg.horizontalDegree, vDeg: lookAtDeg.verticalDegree , imm: false , userinfo: getUserInfo(args.header)},'*');
        return;
    }

    
    if(args.message.includes('changeScene')){
        // var iframe = document.getElementById('vr360_player_area').contentWindow; 
        // iframe.postMessage({ parentData : 'scene1'},'*');
        var changeMsg = args.message.split( ',' );
        var iframe = document.getElementById('vr360_player_area').contentWindow; 
        iframe.postMessage({ parentData : 'changeScene', sceneId:changeMsg[1]},'*');
        
    }
    if(args.message === 'scene2'){
        var iframe = document.getElementById('vr360_player_area').contentWindow; 
        iframe.postMessage({ parentData : 'scene2'},'*');
    }
    if(args.message.includes('hostHighLight')){
        var iframe = document.getElementById('vr360_player_area').contentWindow; 
        var lookAtDeg = JSON.parse(args.message.split('||')[1]);
        
        iframe.postMessage({ parentData : 'hostHighLight' , hDeg: lookAtDeg.horizontalDegree, vDeg: lookAtDeg.verticalDegree , imm: false},'*');
        
    }
    if(args.message.includes('getLookAt')){
        // var iframe = document.getElementById('vr360_player_area').contentWindow; 
        // iframe.postMessage({ parentData : 'getL'},'*');
        var lookAtDeg = JSON.parse(args.message.split('||')[1]);
        console.log(lookAtDeg);
        var iframe = document.getElementById('vr360_player_area').contentWindow; 
        iframe.postMessage({ parentData : 'lookAt' , hDeg: lookAtDeg.horizontalDegree, vDeg: lookAtDeg.verticalDegree , imm: false},'*');
        
    }

    $('#log-area').append(args.header + " :: "  + args.message + '<br/>');
    
    // var newMessageDIV = document.createElement('div');
    // newMessageDIV.className = 'new-message';

    // var userinfoDIV = document.createElement('div');
    // userinfoDIV.className = 'user-info';
    // userinfoDIV.innerHTML = args.userinfo || '<img src="images/user.png">';

    // userinfoDIV.style.background = args.color || rtcMultiConnection.extra.color || getRandomColor();

    // newMessageDIV.appendChild(userinfoDIV);

    // var userActivityDIV = document.createElement('div');
    // userActivityDIV.className = 'user-activity';

    // userActivityDIV.innerHTML = '<h2 class="header">' + args.header + '</h2>';

    // var p = document.createElement('p');
    // p.className = 'message';
    // userActivityDIV.appendChild(p);
    // p.innerHTML = args.message;

    // newMessageDIV.appendChild(userActivityDIV);

    // main.insertBefore(newMessageDIV, main.firstChild);

    // userinfoDIV.style.height = newMessageDIV.clientHeight + 'px';

    // if (args.callback) {
    //     args.callback(newMessageDIV);
    // }

    // document.querySelector('#message-sound').play();
}

// $('#your-name').onkeyup = function(e) {
//     if (e.keyCode != 13) return;
//     $('#continue').onclick();
// };

// $('#room-name').onkeyup = function(e) {
//     if (e.keyCode != 13) return;
//     $('#continue').onclick();
// };


// $('#room-name').val(localStorage.getItem('room-name') || (Math.random() * 1000).toString().replace('.', ''));
$('#room-name').val((Math.random() * 1000).toString().replace('.', ''));
if(localStorage.getItem('user-name')) {
    $('#your-name').value = localStorage.getItem('user-name');
}



function joinroom(_mode) {
    console.log("continue");
    var yourName = $('#your-name').val();
    var roomName = $('#room-name').val();

    console.log(yourName);
    console.log(roomName);
    
    // if(!roomName.value || !roomName.value.length) {
    //     roomName.focus();
    //     return alert('Your MUST Enter Room Name!');
    // }
    
    localStorage.setItem('room-name', roomName);
    localStorage.setItem('user-name', yourName);
    
    // yourName.disabled = roomName.disabled = this.disabled = true;

    var username = yourName || 'Anonymous';

    rtcMultiConnection.extra = {
        username: username,
        color: getRandomColor()
    };

    addNewMessage({
        header: username,
        message: 'Searching for existing rooms...',
        userinfo: '<img src="images/action-needed.png">'
    });
    
    var roomid = $('#room-name').val();
    rtcMultiConnection.channel = roomid;
    rtcMultiConnection.mode = _mode;
	
	var firebaseRoomSocket = new Firebase(rtcMultiConnection.resources.firebaseio + rtcMultiConnection.channel + 'openjoinroom');
	
	firebaseRoomSocket.once('value', function (data) {
		var sessionDescription = data.val();

		// checking for room; if not available "open" otherwise "join"
		if (sessionDescription == null) {
			addNewMessage({
                header: username,
                message: 'No room found. Creating new room...<br />'+location.href.replace('simple-test', 'simple-test-client') + '?id=' + roomid ,
                userinfo: '<img src="images/action-needed.png">'
            });

            $('#share-addr').val(location.href.replace('simple-test', 'simple-test-client') + '?id=' + roomid);
            rtcMultiConnection.userid = roomid;
            rtcMultiConnection.open({
                dontTransmit: true,
                sessionid: roomid
            });
			
			firebaseRoomSocket.set(rtcMultiConnection.sessionDescription);
					
			// if room owner leaves; remove room from the server
			firebaseRoomSocket.onDisconnect().remove();
		} else {
			addNewMessage({
                header: username,
                message: 'Room found. Joining the room...',
                userinfo: '<img src="images/action-needed.png">'
            });
            rtcMultiConnection.join(sessionDescription);
		}

		console.debug('room is present?', sessionDescription == null);
	});
}

$('#continue').click(function(){
    joinroom();
});

function getUserinfo(blobURL, imageURL) {
    return blobURL ? '<video src="' + blobURL + '" autoplay controls></video>' : '<img src="' + imageURL + '">';
}

var isShiftKeyPressed = false;

// getElement('.main-input-box textarea').onkeydown = function(e) {
//     if (e.keyCode == 16) {
//         isShiftKeyPressed = true;
//     }
// };

// var numberOfKeys = 0;
// getElement('.main-input-box textarea').onkeyup = function(e) {
//     numberOfKeys++;
//     if (numberOfKeys > 3) numberOfKeys = 0;

//     if (!numberOfKeys) {
//         if (e.keyCode == 8) {
//             return rtcMultiConnection.send({
//                 stoppedTyping: true
//             });
//         }

//         rtcMultiConnection.send({
//             typing: true
//         });
//     }

//     if (isShiftKeyPressed) {
//         if (e.keyCode == 16) {
//             isShiftKeyPressed = false;
//         }
//         return;
//     }


//     if (e.keyCode != 13) return;

//     addNewMessage({
//         header: rtcMultiConnection.extra.username,
//         message: 'Your Message:<br /><br />' + linkify(this.value),
//         userinfo: getUserinfo(rtcMultiConnection.blobURLs[rtcMultiConnection.userid], 'images/chat-message.png'),
//         color: rtcMultiConnection.extra.color
//     });

//     rtcMultiConnection.send(this.value);

//     this.value = '';
// };

// getElement('#allow-webcam').onclick = function() {
//     this.disabled = true;

//     var session = { audio: true, video: true };

//     rtcMultiConnection.captureUserMedia(function(stream) {
//         var streamid = rtcMultiConnection.token();
//         rtcMultiConnection.customStreams[streamid] = stream;

//         rtcMultiConnection.sendMessage({
//             hasCamera: true,
//             streamid: streamid,
//             session: session
//         });
//     }, session);
// };

// getElement('#allow-mic').onclick = function() {
//     this.disabled = true;
//     var session = { audio: true };

//     rtcMultiConnection.captureUserMedia(function(stream) {
//         var streamid = rtcMultiConnection.token();
//         rtcMultiConnection.customStreams[streamid] = stream;

//         rtcMultiConnection.sendMessage({
//             hasMic: true,
//             streamid: streamid,
//             session: session
//         });
//     }, session);
// };

// getElement('#allow-screen').onclick = function() {
//     this.disabled = true;
//     var session = { screen: true };

//     rtcMultiConnection.captureUserMedia(function(stream) {
//         var streamid = rtcMultiConnection.token();
//         rtcMultiConnection.customStreams[streamid] = stream;

//         rtcMultiConnection.sendMessage({
//             hasScreen: true,
//             streamid: streamid,
//             session: session
//         });
//     }, session);
// };

// getElement('#share-files').onclick = function() {
//     var file = document.createElement('input');
//     file.type = 'file';

//     file.onchange = function() {
//         rtcMultiConnection.send(this.files[0]);
//     };
//     fireClickEvent(file);
// };

function fireClickEvent(element) {
    var evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });

    element.dispatchEvent(evt);
}

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Bytes';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)')
                      .exec(window.location.search);

    return (results !== null) ? results[1] || 0 : false;
}
