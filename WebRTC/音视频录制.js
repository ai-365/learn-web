'use strict'

//视频录制
var videoplay = document.querySelector("video#player");
//视频播放
var recvideoplay = document.querySelector("video#recplayer");
//约束显示
var divConstraints = document.querySelector("div#constraints");

//--------按钮
var btnRecord = document.querySelector("button#record");
var btnRecplay = document.querySelector("button#recplay");
var btnDownload = document.querySelector("button#download");

var buffer;    //存储录制数据
var mediaRecorder;    //对象

function start(){
    console.log("start......");
    if(!navigator.mediaDevices || 
        !navigator.mediaDevices.getUserMedia){
        console.log("getUserMedia is not supported!");
    }else{
        var constraints = {
            video : {
                width:320,
                height:240,
                frameRate:30,
                facingMode:"user"
            },
            audio : {
                noiseSuppression:true,
                echoCancellation:true
            },
        }

        navigator.mediaDevices.getUserMedia(constraints)
                    .then(getMediaStream)
                    .catch(handleError);
    }
}

function getMediaStream(stream){
    window.stream = stream;            //将stream变量放入全局中

    videoplay.srcObject = stream;    //设置采集到的流进行播放

    //获取视频的track
    var videoTrack = stream.getVideoTracks()[0];        //只有一个，所以只取一个
    var videoConstraints = videoTrack.getSettings();    //获取约束对象

    divConstraints.textContent = JSON.stringify(videoConstraints,null,2);        //转为json
}

function handleError(err){
    console.log(err.name+":"+err.message);
}

start();    //开始执行逻辑

//---------设置事件：录制-----

//设置数据处理函数
function handleDataAvail(e){
    if(e && e.data && e.data.size > 0){
        buffer.push(e.data);    
    }
}


//录制与停止录制
function startRecord(){
    buffer = [];    //定义数据

    var options = {
        mimeType: "video/webm;codecs=vp8"
    }

    if(!MediaRecorder.isTypeSupported(options.mimeType)){    //查看是否支持这个类型
        console.error("${options.mimeType} is not suppported!");
        return;
    }

    try{
        mediaRecorder = new MediaRecorder(window.stream,options);
    }catch(e){
        console.error("Failed to create MediaRecoder!");
        return;
    }

    mediaRecorder.ondataavailable = handleDataAvail;
    mediaRecorder.start(10);    //设置时间片存储数据
}

function stopRecord(){
    mediaRecorder.stop();        //停止录制
}

btnRecord.onclick = function(){
    if(btnRecord.textContent === "Start Record"){
        startRecord();
        btnRecord.textContent = "Stop Record";
        btnRecplay.disabled = true;
        btnDownload.disabled = true;
    }else{
        stopRecord();
        btnRecord.textContent = "Start Record";
        btnRecplay.disabled = false;
        btnDownload.disabled = false;    
    }
}

//---------设置事件：播放-----


btnRecplay.onclick = function(){
    var blob = new Blob(buffer,{type: 'video/webm'});        //生成了一个可以处理buffer的对象
    recvideoplay.src = window.URL.createObjectURL(blob);    //获取数据所在位置
    recvideoplay.srcObject = null;    //实时获取数据时才需要
    recvideoplay.controls = true;    //进行播放控制，播放与暂停
    recvideoplay.play();    //进行播放
}

//---------设置事件：下载-----

btnDownload.onclick = function(){
    var blob = new Blob(buffer,{type: 'video/webm'});
    var url = window.URL.createObjectURL(blob);

    var a = document.createElement("a");    //模拟链接，进行点击下载
    a.href = url;
    a.style.display = "none";    //不显示
    a.download = "video.webm";
    a.click();
}