(function () {
  "use strict";

  const MESSAGE_TYPE = {
    SDP: 'SDP',
    CANDIDATE: 'CANDIDATE',
  }


  document.addEventListener('click', async (event) => {
    if (event.target.id === 'start') {
      startChat();
    }
    if (event.target.id === 'call') {

    }
  });

  //create signaling
const signaling =  io.connect('ws://127.0.0.1:4005');
//let peerConnection ;

let user ;
let user_list = [];
/***********************Socket Code *************************/
signaling.on('user_connected', function(user_id) {
  console.log('user_connected '+signaling.id+'!='+ user_id)
    if(signaling.id == user_id){
      user = signaling.id
    }else{
      user_list.push(user_id)
    }


});

const addMessageHandler = (signaling, peerConnection) => {
signaling.on('message', async function(message) {

  const data = JSON.parse(message.message);

        if (!data) {
          return;
        }
      console.log(user)
        if(message.user != user && user != undefined){
          console.log(message.user+"!="+ user)
          const { message_type, content } = data;
          try {
            if (message_type === MESSAGE_TYPE.CANDIDATE && content) {
              //candidates.push(content); new RTCIceCandidate()
              await peerConnection.addIceCandidate(content);
            } else if (message_type === MESSAGE_TYPE.SDP) {
                console.log(message)
                if (content.type === 'offer') {

                  await peerConnection.setRemoteDescription(content);
                  const answer = await peerConnection.createAnswer();
                  await peerConnection.setLocalDescription(answer);

                  signaling.send(JSON.stringify({
                    message_type: MESSAGE_TYPE.SDP,
                    content: answer,
                  }));
                } else if (content.type === 'answer') {

                  await peerConnection.setRemoteDescription(new RTCSessionDescription(content));
                } else {
                  console.log('Unsupported SDP type.');
                }
            }
            console.log(message)
          } catch (err) {
            console.error(err);
          }
        }
});
}
/****************Socket Code ***************************/



const startChat = async () => {
  try {
    // Caller call capture media ask for permissions from browser to get audio and video
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    showChatRoom();

    document.getElementById('localVideo').srcObject = stream;

    const peerConnection = await createPeerConnection();

    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
    //peerConnection.addStream(stream);

    addMessageHandler(signaling,peerConnection)
  } catch (err) {
    console.error(err);
  }
};







const createPeerConnection = async () => {

// Caller Create RTC Connection
    const peerConnection =  new RTCPeerConnection(turnConfig);

  peerConnection.onnegotiationneeded = async () => {
    await createAndSendOffer(signaling,peerConnection);
  };

 peerConnection.onicecandidate = (iceEvent) => {

    if (iceEvent && iceEvent.candidate) {
      signaling.send(JSON.stringify({
        message_type: MESSAGE_TYPE.CANDIDATE,
        content: iceEvent.candidate,
      }));
    }
  };

  peerConnection.ontrack = (event) => {
    const video = document.getElementById('remoteVideo');
    if (!video.srcObject) {
      video.srcObject = event.streams[0];
    }
  };

  /*peerConnection.addEventListener("track", e => {
   const video = document.getElementById('remoteVideo');
   video.srcObject = event.streams[0];

  }, false);*/


  return peerConnection;
};


let candidates = [];





  /*const addMessageHandler = (signaling, peerConnection) => {
    signaling.onmessage = async (message) => {
      const data = JSON.parse(message.data);

      if (!data) {
        return;
      }

      const { message_type, content } = data;
      try {
        if (message_type === MESSAGE_TYPE.CANDIDATE && content) {
          await peerConnection.addIceCandidate(content);
        } else if (message_type === MESSAGE_TYPE.SDP) {
          if (content.type === 'offer') {
          console.log('offer')
            await peerConnection.setRemoteDescription(content);
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            signaling.send(JSON.stringify({
              message_type: MESSAGE_TYPE.SDP,
              content: answer,
            }));
          } else if (content.type === 'answer') {
            console.log('answer')
            await peerConnection.setRemoteDescription(content);
          } else {
            console.log('Unsupported SDP type.');
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
  };*/

  const createAndSendOffer = async (signaling, peerConnection) => {

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    signaling.send(JSON.stringify({ message_type: MESSAGE_TYPE.SDP, content: offer, from_user:user ,to_user:user_list }));
  };

  const showChatRoom = () => {
    document.getElementById('start').style.disabled = 'true';
    //document.getElementById('chat-room').style.display = 'block';
  };


})();