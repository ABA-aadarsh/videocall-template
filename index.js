const peersVideoContainer=document.querySelector(".peerVideosContainer")
const myVideo=document.querySelector("#myVideo")
const peersContainer=document.querySelector(".peersContainer")
let localStream
let videoDevices=[]
let audioDevices=[]
let peersArray=[]
const socket=io("https://localhost:8080")
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
            await makeCall()
        })
    })
})

const makeCall=async (id)=>{

}