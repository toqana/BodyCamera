/* 

SOFTWARE LICENSE, COPYRIGHT, AND RELEASE OF LIABILITY FOR USE OF AUDIO AND VIDEO RECORDING

Copyright 2022 Toqana Consulting, LLC (A Nevada Limited Liability Company)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
and associated documentation files (the "Software"), to deal in the Software without restriction, 
including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, 
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial 
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE 
AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE, INCLUDING, 
BUT NOT LIMITED TO, THE ETHICAL AND LAWFUL USE OF AUDIO AND VIDEO RECORDING.

Contact:  BodyCamera@OTTStreamingVideo.net

*/

"use strict";

Object.defineProperty(Date.prototype, 'YYYYMMDDHHMMSSmmm', {
  
  value: function() {
    
    function pad2(n) {  // always returns a string
      return (n < 10 ? '0' : '') + n;
    }
    
    function pad3(n) {  // always returns a string
      if (n < 10) {return '00' + n}
      else if (n < 100) {return '0' + n}
      else {return '' + n}
    }
        
    return this.getFullYear() + '-' +
       pad2(this.getMonth() + 1) + '-' +
       pad2(this.getDate()) + '_' +
       pad2(this.getHours()) + ':' +
       pad2(this.getMinutes()) + ':' +
       pad2(this.getSeconds()) + '.' +
       pad3(this.getMilliseconds());
  }
});

function ts(){
  return new Date().YYYYMMDDHHMMSSmmm() + " : ";
}

function ts1(){
  return new Date().YYYYMMDDHHMMSSmmm();
}

var ws3;
var ws4;
var video;
var cfgStr;
var cfgObj;
var browserShowDebug;
var browserShowGeolocation;
var fullScreenDesired = false;

window.addEventListener('resize', (evt) => { 
    if (window.innerHeight == screen.height) {
        console.log(ts()+"safety3-browser.js full screen, window.innerHeight: %s, screen.height: %s", window.innerHeight, screen.height);
    } else {
        console.log(ts()+"safety3-browser.js normal screen, window.innerHeight: %s, screen.height: %s", window.innerHeight, screen.height);
        document.getElementById("btn_Fullscreen").style.display = "block";
    }
});

window.addEventListener('load', () => {
  
  cfgStr = document.getElementById("div_cfgStr").value;
  
  try {
    cfgObj = JSON.parse(cfgStr);
  }
  catch (err) {
    console.log(ts()+"safety3-browser.js ERROR cfgObj is not valid json object", {cfgObj});
    document.getElementById("div_geolocation").innerHTML = "ERROR cfgObj is not valid json object, aborted";
    throw new Error("ERROR cfgObj is not valid json object, aborted");
  }
  
  browserShowDebug = document.getElementById("div_debug");
  
  if (cfgObj.browserShowDebug) {
    browserShowDebug.style.display = "block";
  }
  
  browserShowGeolocation = document.getElementById("div_geolocation");
  
  //
  // debug
  //

  console.log(ts()+"safety3-browser.js window onload", {cfgStr});
  console.log(ts()+"safety3-browser.js window onload", {cfgObj});
  
  browserShowDebug.innerHTML += "<br>" + JSON.stringify(cfgObj, null, 2);
  
  ws3_start();
  
  ws4_start();
  
}); // window.addEventListener('load'

function ws3_start() {
  
  //
  // TCL ws3 control
  //
  
  var ws3str = 'ws://' + cfgObj.ws3ServerDomain + ':' + cfgObj.ws3ServerPort + '/' + cfgObj.ws3ServerChannel;
  
  browserShowDebug.innerHTML += "<br>ws3str: " + ws3str;
  
  ws3 = new WebSocket(ws3str);

  ws3.addEventListener('close', (event) => {

    console.log(ts()+"safety3-browser.js ws3 close");
    
    ws3 = null;
    
    setTimeout(function(){ // try to reconnect after a delay

      ws3_start();
         
    }, cfgObj.reconnect_mSec);

  });

  ws3.addEventListener('open', (event) => {
    
    browserShowDebug.innerHTML += "<br>safety3-browser.js ws3 open";
    
    console.log(ts()+"safety3-browser.js ws3 open");
    ws3.send(JSON.stringify({"cmd":"ws3_browser_handshake_sent"}));
    
  });

  ws3.addEventListener('error', (event) => {
    
    console.log(ts()+"safety3-browser.js ws3 error", {error});
    browserShowGeolocation.innerHTML += "<br>" + "error: " + ws3str + ": " + JSON.stringify(event);
    
  });
  
  ws3.addEventListener('message', (event) => {
    
    console.log(ts()+"safety3-browser.js ws3 message from server: ", event.data);
    browserShowDebug.innerHTML += "<br>safety3-browser.js ws3 message from server: " + event.data;
    
    var jsonObj   = {};
    
    try {
      
      jsonObj = JSON.parse(event.data.toString());
             
    }
    catch (err) {
      console.log(ts()+"safety3-browser.js ws3 message not JSON err: ", {err});
      return;
    }    

    if(jsonObj.cmd == "ws3_browser_handshake_received") {
      
      console.log(ts()+"safety3-browser.js ws3_browser_handshake_received");
      browserShowGeolocation.innerHTML += "<br>" + "handshake ok: " + ws3str;
      
    }
    
    if(jsonObj.auth_status == "auth_ok") {
      
      console.log(ts()+"jsonObj.auth_status == auth_ok");
      
      browserShowDebug.innerHTML += "<br>jsonObj.auth_status == auth_ok for div_auth";
      
      document.getElementById("auth_value").value       = "";
      
      document.getElementById("div_auth").style.display = "none";
      document.getElementById("div_safe").style.display = "block";
      
      browserShowDebug = document.getElementById("div_debug_safe");
      
      if (cfgObj.browserShowDebug) {
        browserShowDebug.style.display = "block";
      }      
      
      browserShowDebug.innerHTML  = "<br>jsonObj.auth_status == auth_ok for div_safe";
      
      console.log(ts()+"div_safe block");
      
      video_start();
      
      geolocation_start();      
      
    }

    if(jsonObj.auth_status == "auth_reject") {
      
      console.log(ts()+"jsonObj.auth_status == auth_reject");
      
      browserShowDebug.innerHTML += "<br>jsonObj.auth_status == auth_reject";
      
      document.getElementById("auth_value").value       = "";
      
      document.getElementById("div_auth").style.display = "block";
      document.getElementById("div_safe").style.display = "none";
      
    }
    
  }); //  ws3.addEventListener('message'  
  
} // function ws3_start()

function ws4_start() {
  
  var ws4str = 'ws://' + cfgObj.ws4ServerDomain + ':' + cfgObj.ws4ServerPort + '/' + cfgObj.ws4ServerChannel;

  browserShowDebug.innerHTML += "<br>ws4str: " + ws4str;
  
  ws4 = new WebSocket(ws4str);

  ws4.addEventListener('close', (event) => {

    console.log(ts()+"safety3-browser.js ws4 close");
    
    ws4 = null;
    
    setTimeout(function(){ // try to reconnect after a delay

      ws4_start();
         
    }, cfgObj.reconnect_mSec);

  });

  ws4.addEventListener('open', (event) => {
    
    browserShowDebug.innerHTML += "<br>safety3-browser.js ws4 open";
    
    console.log(ts()+"safety3-browser.js ws4 open");
    ws4.send("ws4_browser_handshake_sent");
    
    browserShowGeolocation.innerHTML += "<br>open: " + ws4str;
    
  });

  ws4.addEventListener('error', (event) => {
    
    console.log(ts()+"safety3-browser.js ws4 error", {event});
    browserShowGeolocation.innerHTML += "<br>error: " + ws4str + ": " + JSON.stringify(event);
    
  });
  
  ws4.addEventListener('message', (event) => {
    
    browserShowDebug.innerHTML += "<br>safety3-browser.js ws4 message from server: " + event.data;
    
    console.log(ts()+"safety3-browser.js ws4 message from server: ", event.data);
    console.log(ts()+"safety3-browser.js ws4 message length from server: ", event.data.length);
    
  }); //  ws4.addEventListener('message'    
  
} // function ws4_start()

function doFullscreen() {
  
  console.log(ts()+"safety3-browser.js doFullscreen()");
  
  let elSafe = document.getElementById("div_safe");
      
  elSafe.requestFullscreen({ navigationUI: "hide" }).catch((err) => {
    
    let errMsg = `fullscreen error, message: ${err.message}, name: (${err.name})`;
    browserShowDebug.style.display = "block";
    browserShowDebug.innerHTML  = "<br>" + errMsg;
    
  });
  
  //elSafe.style.display = "none";
  
  document.getElementById("btn_Fullscreen").style.display = "none";
  browserShowDebug.style.display = "none";
  document.getElementById("video").style.display = "none";
  document.getElementById("div_geolocation").style.display = "none";
  document.getElementById("div_debug_safe").style.display = "none";
  
} 

function auth_request(){
  
  browserShowDebug.innerHTML += "<br>auth_request()";
  console.log(ts()+"safety3-browser.js auth_request()");
  
  let auth_value = document.getElementById("auth_value").value;
  let pw_hash    = md5(auth_value);
  //console.log(ts()+"safety3-browser.js pw_hash: %s", pw_hash);
  
  ws3.send(JSON.stringify({"cmd":"auth_request","pw_hash":pw_hash}));
  
}

function video_start() {
  
  browserShowDebug.innerHTML += "<br>video_start()";
  
  console.log(ts()+"safety3-browser.js video_start()");
  
  var ws4cnt     = 0*1;
   
  //
  // video element init
  //
  
  video = document.getElementById("video");
  video.setAttribute("playsinline", "");
  video.setAttribute("autoplay", "");
  video.setAttribute("muted", "");
  video.style.width  = "640px";
  video.style.height = "480px";

  if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
    console.log(ts()+"safety3-browser.js mediaDevices SUCCESS");
  } else {
    console.log(ts()+"safety3-browser.js mediaDevices FAIL");
    return;
  }
  
  async function getDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices;
  }
  
  getDevices().then(devices => {
    
    console.log(ts()+"safety3-browser.js", {devices});
    browserShowDebug.innerHTML += "<br>" + JSON.stringify(devices, null, 2);
    
    var select_text     = "back";
    
    /*
    
    //
    // note: deviceId can change on every browser page load
    //
    
    var select_deviceId = "not-found";
    var select_cnt      = 0*1;
    
    for (var i = 0; i < devices.length; i++) {
      
      browserShowDebug.innerHTML += "<br>devices[" + i + "]: " + JSON.stringify(devices[i]) + "<br>";
        
      if (devices[i]['label'].includes(select_text)) {
        
        select_deviceId = devices[i]['deviceId'];
        
        browserShowDebug.innerHTML += "<br>select_deviceId: " + select_deviceId + "<br>";
        
        select_cnt++;
        
      }
      
    }
    
    if (select_cnt == 0*1) {
      
      browserShowDebug.innerHTML += "<br>" + select_text + " not found<br>";
      
    }
    
    */
    
    const facingMode = select_text;
    
    const constraints = {
      audio: true,
      video: {
        facingMode
      }
    };
    
    console.log(ts()+"safety3-browser.js", {constraints});
    browserShowDebug.innerHTML += "<br>constraints:<br>" + JSON.stringify(constraints, null, 2);
      
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      
      browserShowDebug.innerHTML += "<br>navigator.mediaDevices.getUserMedia(constraints).then((stream)";
      
      video.srcObject = stream;
      
      video.volume    = 0.0; // video tag output volume (not microphone input gain)
      
      const options = {
        audioBitsPerSecond  : cfgObj.audioBitsPerSecond,
        videoBitsPerSecond  : cfgObj.videoBitsPerSecond,
        mimeType            : cfgObj.mimeType
      }
      
      browserShowDebug.innerHTML += "<br>options:<br>" + JSON.stringify(options, null, 2);
      
      const mediaRecorder = new MediaRecorder(stream, options);
      
      mediaRecorder.start(cfgObj.timeslice); // create new .webm header

      mediaRecorder.ondataavailable = (e) => {
        
        //let t = typeof e.data;
        //browserShowDebug.innerHTML += "<br>" + ts() + "mediaRecorder.ondataavailablem typeof e.data: " + t;
        
        ws4.send(e.data); // immediately send e.data to TCL
        
        /*
        if (cfgObj.browserDebug) {
          console.log(ts()+"safety3-browser.js mediaRecorder.ondataavailable e.data.size: %s, ws4cnt: %s", e.data.size, ws4cnt);
        }
        */
        
        if (ws4cnt >= cfgObj.ws4cntMax) {
          
          if (cfgObj.browserDebug) {
            console.log(ts()+"safety3-browser.js mediaRecorder.ondataavailable (ws4cnt) %s >= (ws4cntMax) %s: ", ws4cnt, cfgObj.ws4cntMax);
          }
          
          mediaRecorder.stop();
          
          ws4cnt = 0*1;
          
          mediaRecorder.start(cfgObj.timeslice); // create new .webm header
          
          if (cfgObj.browserDebug) {
            console.log(ts()+"safety3-browser.js mediaRecorder.ondataavailable e.data.type: ", e.data.type);
          }
          
          geolocation_update();
          
        } else {
           ws4cnt++;
        }
        
      }
          
    }); // navigator.mediaDevices.getUserMedia(constraints).then((stream)    

  }); // getDevices().then(devices

} // function video_start()

async function saveFile(e_data_blob) {
  
  console.log(ts()+"safety3-browser.js saveFile(e_data_blob)");

  // create a new handle
  const newHandle = await window.showSaveFilePicker();

  // create a FileSystemWritableFileStream to write to
  const writableStream = await newHandle.createWritable();

  // write our file
  await writableStream.write(e_data_blob);

  // close the file and write the contents to disk.
  await writableStream.close();
}

function geolocation_start() {
  
  console.log(ts()+"safety3-browser.js geolocation_start()");
  
  browserShowDebug.innerHTML += "<br>geolocation_start()";
  
  if (!navigator.geolocation) {
    browserShowGeolocation.style.display  = "block";
    browserShowGeolocation.innerHTML      += "<br>" + ts() + "geolocation not available";
  } else {
    browserShowGeolocation.style.display  = "block";
    browserShowGeolocation.innerHTML      += "<br>" + ts() + "geolocation is available";
    navigator.geolocation.getCurrentPosition(geolocation_success, geolocation_error);
  }

}
  
function geolocation_success(position){
  
  console.log(ts()+"safety3-browser.js geolocation_success(position)", {position});
  
  const latitude  = position.coords.latitude;
  const longitude = position.coords.longitude;
  
  browserShowGeolocation.innerHTML += "<br>" + ts() + "latitude:  " + latitude ;
  browserShowGeolocation.innerHTML += "<br>" + ts() + "longitude: " + longitude;
  
}

function geolocation_error(){
  
  console.log(ts()+"safety3-browser.js geolocation_error)", {error});
  browserShowGeolocation.innerHTML += "<br>" + ts() + "geolocation_error()";
  
}

function geolocation_update() {
  
  //browserShowDebug.innerHTML       += "<br>" + ts() + "geolocation_update()";
  //browserShowGeolocation.innerHTML += "<br>" + ts() + "geolocation_update()";
  
  navigator.geolocation.getCurrentPosition((position) => {
    
    const latitude  = position.coords.latitude;
    const longitude = position.coords.longitude;
    
    //browserShowGeolocation.innerHTML += "<br>" + ts() + "latitude:  " + latitude;
    //browserShowGeolocation.innerHTML += "<br>" + ts() + "longitude: " + longitude;

    let geoObj = {
      "cmd":"geolocation",
      "ts":ts1(),
      "latitude":latitude,
      "longitude":longitude
    };
    
    //console.log(ts()+"safety3-browser.js geolocation_update()", {geoObj});
    //browserShowGeolocation.innerHTML += "<br>" + ts() + "geoObj: " + JSON.stringify(geoObj);
  
    ws3.send(JSON.stringify(geoObj));   // tcl
  
  });
  
}
