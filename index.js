const peersVideoContainer=document.querySelector(".peerVideosContainer")
const myVideo=document.querySelector("#myVideo")
const peersContainer=document.querySelector(".peersContainer")
let localStream
const peerVideo=document.querySelector(".peerVideo")
let videoDevices=[]
let audioDevices=[]
let peersArray=[]
const socket=io("192.168.1.133:8080")
const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
const peerConnection= new RTCPeerConnection(configuration);
const getConnectedDevices=async (type)=>{
    const devices=await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device=>device.kind===type)
}
const openMedia=async (videoDeviceId, minWidth, minHeight, audioDeviceId)=>{
    const contraints={
        "audio":{"echoCancellation": true, "deviceId":audioDeviceId},
        "video":{
            "deviceId":videoDeviceId,
            "width":{"min":minWidth},
            "height":{"min":minHeight}
        }
    }
    return await navigator.mediaDevices.getUserMedia(contraints)
}
const setupMyMediaDevices=async()=>{
    videoDevices=await getConnectedDevices("videoinput")
    audioDevices=await getConnectedDevices("audioinput")
    const stream=await openMedia(
        videoDevices[0].deviceId,
        1280,
        720,
        audioDevices[0].deviceId
    )
    if(stream){
        console.log("Hurray I got the stream", stream)
        localStream=stream
        localStream.getTracks().forEach(track=>{
            peerConnection.addTrack(track,localStream)
        })
        myVideo.srcObject=localStream
        myVideo.muted=true
    }else{
        console.log("What wrong I did?")
    }
}
setupMyMediaDevices()

socket.on("newUser",(updatedUserArray)=>{
    peersArray=updatedUserArray.filter(i=>i!=socket.id)
    peersContainer.innerHTML=""
    peersArray.forEach(id=>{
        peersContainer.innerHTML+=`
            <div
                id='peer-${id}'
            >
                <span>${id}</span>
                <button
                    class="connectBtn"
                    id="${id}"
                >Connect</button>
            </div>
        `
    })
    const connectBtns=[...document.querySelectorAll(".connectBtn")]
    connectBtns.forEach(btn=>{
        btn.addEventListener("click",async ()=>{
            console.log("I want to connect to ",btn.id)
            await makeCall(btn.id)
        })
    })
})
const makeCall=async (id) =>{
    
    peerConnection.ontrack= async (e)=>{
        const [remoteStream] = e.streams;
        peerVideo.srcObject = remoteStream;
        peerVideo.id=id
        peerVideo.classList.remove("blank")
    }

    peerConnection.onicecandidate=async (e)=>{
        if(e.candidate){
            socket.emit("newIceCandidate",e.candidate,id)
        }
    }

    socket.on("newIceCandidate",async(candidate)=>{
        await peerConnection.addIceCandidate(candidate)
    })

    const offer=await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    socket.emit("callOffer",offer,id)
}
socket.on("callResponse",async (answer,status)=>{
    if(status){
        const remoteDesc= new RTCSessionDescription(answer)
        await peerConnection.setRemoteDescription(remoteDesc)
        console.log("Call was accepted",answer)
    }
})
socket.on("callOffer",async (offer,callingPersonId)=>{
    console.log(callingPersonId," is requesting to call me.")
    if (offer) {
        
            
        peerConnection.ontrack= async (e)=>{
            const [remoteStream] = e.streams;
            peerVideo.id=id
            peerVideo.srcObject = remoteStream;
        }
        
        peerConnection.onicecandidate=async (e)=>{
            if(e.candidate){
                console.log("New ice candidate",e.candidate)
                socket.emit("newIceCandidate",e.candidate,callingPersonId)
            }
        }
    
        socket.on("newIceCandidate",async(candidate)=>{
            await peerConnection.addIceCandidate(candidate)
        })


        peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit("callResponse",callingPersonId,answer,true)
        console.log("I am answering the call",offer)
    }else{
        socket.emit("callResponse",callingPersonId,null,false)
    }

})
socket.on("userDisconnected",(id)=>{
    const i = peersArray.find(i=>i==id)
    peersArray.splice(i,1)
    document.querySelector(`#peer-${id}`).remove()
    if(peerVideo && peerVideo.id==id){
        peerVideo.classList.add("blank")
    }
})

peerConnection.addEventListener("connectionstatechange",(e)=>{
    console.log(peerConnection.connectionState)
})