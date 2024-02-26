const peersVideoContainer=document.querySelector(".peerVideosContainer")
const myVideo=document.querySelector("#myVideo")
let videoDevices=[]
let audioDevices=[]

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
        myVideo.srcObject=stream
        myVideo.muted=true
    }else{
        console.log("What wrong I did?")
    }
}
setupMyMediaDevices()