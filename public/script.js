const socket = io('/')

const myPeer = new Peer(undefined,{
    path: '/peerjs',
    host: '/',
    port: '443',
})
const peers = {}
let myVideosStream;
let videoGrid = document.getElementById("video-grid")
let myVideo = document.createElement('video')
myVideo.muted= true
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
}).then((stream) => {
    myVideosStream = stream
    addVideoStream(myVideo, stream)
    myPeer.on('call', (call) => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', (userVideoStream) => {
            addVideoStream(video,userVideoStream)
        })
    })
    socket.on('user-connected', (userId) => {
    connectToNewUser(userId,stream)
    })
    let text = $("input");
    $('html').keydown(function (e) {
        if (e.which == 13 && text.val().length !== 0) {
            socket.emit('message', text.val());
            text.val('')
        }
    })
    socket.on('createMessage', (message) => {
        $("ul").append(`<li class = "message"><b>user<b/><br/>${message}</li>`)
    } )




})
myPeer.on('open', (id) => {
    socket.emit('join-room', ROOM_ID, id)
    
});
socket.on('user-disconnected', (userId) => {
    if(peers[userId]) peers[userId].close()
})


const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
    });
    videoGrid.append(video);
};
function connectToNewUser (userId,stream){
    console.log("bini connected", userId)
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video');
    call.on("stream", (userVideoStream) => {
        addVideoStream(video,userVideoStream)
    })
    call.on('close', () => {
        video.remove();
    })
    peers[userId] = call;
}
const playStop = () => {
    let enabled = myVideosStream.getVideoTracks()[0].enabled;
    console.log(myVideosStream.getVideoTracks())
    if (enabled) {
        myVideosStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        setStopVideo()
        myVideosStream.getVideoTracks()[0].enabled = true
    }
}


const muteUnmute = () => {
    const enabled = myVideosStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideosStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();

    } else {
        setMuteButton();
        myVideosStream.getAudioTracks()[0].enabled = true;


    }
}
const setMuteButton = () => {
    const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
    `;
    document.querySelector(".main__mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
    const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
    `;
    document.querySelector(".main__mute_button").innerHTML = html;
};

const setStopVideo = () => {
    const html = `<i class ='fas fa-video'></i>
    <span> stop Video</span>`;
    document.querySelector('.main__video_button').innerHTML = html;
}
const setPlayVideo = () => {
    const html = `<i class = 'stop fas fa-video-slash'></i>
    <span>play video</span>`;
    document.querySelector('.main__video_button').innerHTML= html
}

