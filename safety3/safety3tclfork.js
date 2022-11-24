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

//process.env.TZ                    = "America/Los_Angeles"; // use the same timezone in all js files

const time_exports                = require("./time_exports.js");
const ts                          = time_exports.ts;
const ts1                         = time_exports.ts1;
const ts2                         = time_exports.ts2;
const ts3                         = time_exports.ts3;
const tsDTnow                     = time_exports.tsDTnow;
const tsDT                        = time_exports.tsDT;
const DO_tsDT                     = time_exports.DO_tsDT;

const fs                          = require('fs');            // in base package
const {exec,execSync,spawn,fork}  = require("child_process"); // in base package

const ip                          = require("ip");
const util                        = require('util');

//
// cfgObj
//

var cfgObj                        = JSON.parse(process.env.cfgStr);

//
// process.exit() via SIGINT or SIGTERM
//

process.on('SIGINT', function(){
  
  console.log();
  console.log();
  console.log(ts()+"safety3tclfork.js process.on('SIGINT' (e.g. 'CTRL-C') -> process.exit()");
  console.log();
  
  process.exit();  

});

process.on('SIGTERM', function(){
  
  console.log();
  console.log();
  console.log(ts()+"safety3tclfork.js process.on('SIGTERM' (e.g. 'kill') -> process.exit()");
  console.log();
  
  process.exit();  

});

//
// uncaughtException
//

process.on('uncaughtException', err => {
  
  console.log(ts()+"safety3tclfork.js FATAL ERROR process.on('uncaughtException' err:\n", err);
  console.log();
  process.exit(1); // mandatory (as per the Node.js docs)
  
});

//
// parent process
//

process.send({"ts":ts1(),"cmd":"msg-from-child"});

process.on('message', (msg) => {
  
  //console.log(ts()+"safety3tclfork.js parent process.on('message'", {msg});
  
  var jsonObj   = {};
  
  try {
    jsonObj = JSON.parse(JSON.stringify(msg));
  }
  catch (err) {
    console.log(ts()+"safety3tclfork.js parent process.on('message' not json err: ", {err});
    process.exit();
  }
  
  if(msg.cmd == "webm-found") {
    
    setTimeout(function(){ // 2 times longer than fileData
    
      console.log(ts()+"safety3tclfork.js parent process.on('message' webm-found msg.filename: %s", msg.filename);
      
      let arr = msg.filename.split("/");
      let fn  = arr[arr.length - 1];
      
      try {
        
        let fileData = fs.readFileSync(msg.filename, {encoding:'utf16le'}); // https://stackoverflow.com/questions/14551608/list-of-encodings-that-node-js-supports
        
        fileLogAdd(fn, fs.statSync(msg.filename).size);
        
      }
      catch (err) {
        console.log(ts()+"safety3tclfork.js webm-found fs.readFileSync catch err:", {err});
      }
      
    }, cfgObj.timeslice * cfgObj.wss2cntMax * 2);
    
  } // if(msg.cmd == "webm-found")

  if(msg.cmd == "geolocation-update") {
    
    console.log(ts()+"safety3tclfork.js parent process.on('message' geolocation-update msg.filename: %s", msg.filename);
    
    let fileData;
    
    try {
      fileData = fs.readFileSync(msg.filename, {encoding:'utf8'});
    }
    catch (err) {
      console.log(ts()+"safety3tclfork.js geolocation-update ERROR fs.readFileSync()", {err});
      return; // try again later
    }

    let arr = msg.filename.split("/");
    let fn  = arr[arr.length - 1];
      
    try {
      if(wss2.readyState == 1){
        wss2.send(JSON.stringify({"cmd":"geolocation-update","filename":fn,"fileData":fileData}));
      }
      else {
        console.log(ts()+"safety3tclfork.js geolocation-update wss2.readyState is NOT READY");
      }
    }
    catch (err) {
      console.log(ts()+"safety3tclfork.js geolocation-update wss2.readyState catch err:", {err});
    }

  } // if(msg.cmd == "geolocation-update")
          
});

//
// fileLog
//

console.log(ts()+"safety3tclfork.js fileLog: %s", cfgObj.fileLog);

if (fs.existsSync(cfgObj.fileLog)) {
  
  var data;
  
  try {
    data = fs.readFileSync(cfgObj.fileLog).toString();
    console.log(ts()+"safety3tclfork.js fileLog exists", {data});
  }
  catch (err) {
    console.log(ts()+"safety3tclfork.js ERROR fs.readFileSync()", {err});
  }
  
  let jsonObj;
  
  try {
    jsonObj = JSON.parse(data);
    console.log(ts()+"safety3tclfork.js fileLog is json object", {jsonObj});
    console.log(ts()+"safety3tclfork.js fileLog jsonObj.length: %s", jsonObj.length);
  }
  catch (err) {
    
    console.log(ts()+"safety3tclfork.js fileLog is NOT json object", {data});
    
    try {
      fs.writeFileSync(cfgObj.fileLog, "[]");
    }
    catch (err) {
      console.log(ts()+"safety3tclfork.js ERROR fs.writeFileSync() cannot write fileLog process.exit(1)", {err});
      process.exit(1);
    }
    
    try {
      let dataNew = fs.readFileSync(cfgObj.fileLog).toString();
    }
    catch (err) {
      console.log(ts()+"safety3tclfork.js ERROR fs.readFileSync()", {err});
    }
    
    console.log(ts()+"safety3tclfork.js fileLog recreated", {dataNew});
      
  }
  
}
else {
  
  try {
    fs.writeFileSync(cfgObj.fileLog, "[]");
  }
  catch (err) {
    console.log(ts()+"safety3tclfork.js ERROR fs.writeFileSync() cannot write fileLog process.exit(1)", {err});
    process.exit(1);
  }
  
  let data;
  
  try {
    data = fs.readFileSync(cfgObj.fileLog).toString();
  }
  catch (err) {
    console.log(ts()+"safety3tclfork.js ERROR fs.readFileSync()", {err});
  }
  
  console.log(ts()+"safety3tclfork.js fileLog created", {data});  
}

function fileLogAdd(fn, length) {

  var jsonObj = fileLogReadObj();
  
  let ts_add = ts1();
  jsonObj.push({"fn":fn,"length":length,"ts_add":ts_add,"ts_resend":ts_add});
  
  fileLogWriteObj(jsonObj);
  
  console.log(ts()+"safety3tclfork.js fileLogAdd length: %s", jsonObj.length); 
  
} // function fileLogAdd(fn, length)

function fileLogDelete(fn) {
  
  console.log(ts()+"safety3tclfork.js fileLogDelete fn: %s", fn);
  
  var jsonObj = fileLogReadObj();
  
  const deleteObj = (data, column, search) => {
    let result = data.filter(m => m[column] !== search);

    return result;
  }
  
  const deleteResultObj = deleteObj(jsonObj, 'fn', fn);
  
  if (deleteResultObj.length > 0) {
    //console.log(ts()+"safety3tclfork.js fileLogDelete after obj", {deleteResultObj});
    console.log(ts()+"safety3tclfork.js fileLogDelete after length: %s", deleteResultObj.length);
  }
  
  fileLogWriteObj(deleteResultObj);
  
} // function fileLogDelete(fn)

//
// cfgObj.utfDebug utilities - start
//
// ascii sub char (0x1a) may be added for padding which may affect file length
//

function bytesToHex(bytes) {
  return Array.from(
    bytes,
    byte => byte.toString(16).padStart(2, "0")
  ).join("");
}

function stringToUTF8Bytes(string) {
  return new TextEncoder().encode(string);
}


function stringToUTF16Bytes(string, littleEndian) {
  const bytes = new Uint8Array(string.length * 2);
  const view = new DataView(bytes.buffer);
  for (let i = 0; i != string.length; i++) {
    view.setUint16(i, string.charCodeAt(i), littleEndian);
  }
  return bytes;
}

function stringToUTF32Bytes(string, littleEndian) {
  const codepoints = Array.from(string, c => c.codePointAt(0));
  const bytes = new Uint8Array(codepoints.length * 4);
  // Using DataView is the only way to get a specific
  // endianness.
  const view = new DataView(bytes.buffer);
  for (let i = 0; i != codepoints.length; i++) {
    view.setUint32(i, codepoints[i], littleEndian);
  }
  return bytes;
}

function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i !== bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
}

//
// cfgObj.utfDebug utilities - end
//

function fileUpload(fn, attempt) {
  
  console.log(ts()+"safety3tclfork.js fileUpload fn: %s", fn);
  
  let filename = cfgObj.clientVideo + fn;
  
  try {
    
    let fileData   = fs.readFileSync(filename, {encoding:'utf16le'});
    let fn_length  = fs.statSync(filename).size;
    
    if (cfgObj.utfDebug) {
      //console.log(ts()+"safety3tclfork.js fileUpload fn_length: %s, fileData[0]: %s, fileData[fileData.length - 1]: %s", fn_length, fileData[0].toString('utf16le'), fileData[fileData.length - 1].toString('utf16le'));
      console.log(ts()+"safety3tclfork.js fileUpload fn_length: %s, fileData[0]: %s, fileData[fileData.length - 1]: %s", fn_length, bytesToHex(stringToUTF16Bytes(fileData[0], false)), bytesToHex(stringToUTF16Bytes(fileData[fileData.length - 1], false)));
      console.log(ts()+"safety3tclfork.js fileUpload fn_length: %s, fileData[0]: %s, fileData[fileData.length - 1]: %s", fn_length, bytesToHex(stringToUTF16Bytes(fileData[0], true)), bytesToHex(stringToUTF16Bytes(fileData[fileData.length - 1], true)));
    }
    
    let sendObj = {"cmd":"file-upload","fn":fn,"fileData":fileData,"fn_length":fn_length,"attempt":attempt};
    console.log(ts()+"safety3tclfork.js fileUpload sendObj.fn_length: %s", sendObj.fn_length);
    
    try {
      if(wss2.readyState == 1){
        wss2.send(JSON.stringify(sendObj));
      }
      else {
        console.log(ts()+"safety3tclfork.js fileUpload wss2.readyState is NOT READY");
      }
    }
    catch (err) {
      console.log(ts()+"safety3tclfork.js fileUpload wss2.readyState catch err:", {err});
    }
    
  }
  catch (err) {
    console.log(ts()+"safety3tclfork.js fileUpload fs.readFileSync catch err:", {err});
  }
  
} // function fileUpload(fn)

function fileLogReadObj() {
  
  let data;
  
  try {
    data = fs.readFileSync(cfgObj.fileLog, 'utf8').toString();
  }
  catch (err) {
    console.log(ts()+"safety3tclfork.js fileLogReadObj fs.readFileSync ERROR", {err}); 
    return;
  }

  var jsonObj = JSON.parse(data);
  
  if(jsonObj.length > 0) {
    //console.log(ts()+"safety3tclfork.js fileLogReadObj", {jsonObj});
    //console.log(ts()+"safety3tclfork.js fileLogReadObj jsonObj.length: %s", jsonObj.length); 
  }
  
  return jsonObj;

} // function fileLogReadObj

function fileLogWriteObj(jsonObj) {
  
  try {
    fs.writeFileSync(cfgObj.fileLog, JSON.stringify(jsonObj));
  }
  catch (err) {
    console.log(ts()+"safety3tclfork.js fileLogWriteObj fs.writeFileSync", {err});
    return;
  }
  
  //console.log(ts()+"safety3tclfork.js fileLogWriteObj length: %s", jsonObj.length); 
  
} // function fileLogWriteObj(jsonObj)

function checkExists(fn) {

        console.log(ts()+"safety3tclfork.js checkExists(%s)", fn);
        
        var fn_length;
        try {
          fn_length = fs.statSync(cfgObj.clientVideo + fn).size;
        }
        catch (err) {
          console.log(ts()+"safety3tclfork.js checkExists(%s) catch ERROR", fn, {err});
          return;
        }
        
        let sendObj = {"cmd":"checkExists","fn":fn,"fn_length":fn_length};
        console.log(ts()+"safety3tclfork.js checkExists() ", {sendObj});
        
        wss2.send(JSON.stringify(sendObj));

} // function checkExists()

var fileLogManage_clear;

function fileLogManage(){
  
  fileLogManage_clear = setInterval(function(){
    
    let jsonObj = fileLogReadObj();
    
    //console.log(ts()+"safety3tclfork.js fileLogManage() jsonObj.length: %s", jsonObj.length);
    //console.log(ts()+"safety3tclfork.js fileLogManage()", jsonObj);
    
    if (jsonObj.length > 0) {
      
      console.log(ts()+"safety3tclfork.js fileLogManage() jsonObj.length: %s", jsonObj.length);
    
      for (let i = 0; i < jsonObj.length; i++) {
        
        //
        // first attempt
        //
        
        if (jsonObj[i].ts_add == jsonObj[i].ts_resend) {
          
          console.log(ts()+"safety3tclfork.js fileLogManage() i: %s, first attempt, fileUpload\n%s", i, util.inspect(jsonObj[i]));
          
          fileUpload(jsonObj[i].fn,"first");
          
          jsonObj[i].ts_resend = ts1(); // set jsonObj[i].ts_resend in case first attempt upload is not successful
          fileLogWriteObj(jsonObj);     // save entire jsonObj
          
          break;
          
        }
        else { // not first attempt
          
          let diff = ts1_diff_mSec(jsonObj[i].ts_resend, ts1());
          console.log(ts()+"safety3tclfork.js fileLogManage() i: %s, diff: %s, cfgObj.fileLogTimeout_mSec: %s, %s", i, diff, cfgObj.fileLogTimeout_mSec, util.inspect(jsonObj[i]));
          
          if (diff >  cfgObj.fileLogTimeout_mSec) {
            
            console.log(ts()+"safety3tclfork.js fileLogManage() i: %s, not first attempt, checkExists ok\n%s", i, util.inspect(jsonObj[i]));
            checkExists(jsonObj[i].fn); // check to see if resend needed
            
          }
          else {
            
            console.log(ts()+"safety3tclfork.js fileLogManage() i: %s, not first attempt, checkExists too soon\n%s", i, util.inspect(jsonObj[i]));
            continue;
            
          }
        }
        
      } // if (jsonObj[i].ts_add == jsonObj[i].ts_resend)
      
    } //if (jsonObj.length > 0)
    
  }, cfgObj.fileLogManage_mSec);
  
} // function fileLogManage()

function ts1_diff_mSec(first, last) {
  
  let diff_mSec = null;
  
  try {
    diff_mSec = new Date( last.replace("_"," ") ).getTime() - new Date( first.replace("_"," ") ).getTime();
  }
  catch (err) {
    console.log(ts()+"safety3tclfork.js ERROR ts1_diff_mSec", {err});
  }
  
  //console.log(ts()+"safety3tclfork.js ts1_diff_mSec", {diff_mSec});
  
  return diff_mSec;
  
} // function ts1_diff_mSec

//
// WebSocket init
//

const url                 = require("url");
const http                = require("http");
const WebSocket           = require("ws");

var wss2cnt               = 0*1;

//
// AC wss2 data
//

var wss2str = 'wss://' + cfgObj.wss2ServerDomain + ':' + cfgObj.wss2ServerPort + '/' + cfgObj.wss2ServerChannel;

console.log(ts()+"wss2str: " + wss2str);

var wss2;

function wss2_start() {

  wss2 = new WebSocket(wss2str, {rejectUnauthorized:false});

  wss2.addEventListener('open', (event) => {
    
    fileLogManage();
    
    console.log(ts()+"safety3tclfork.js wss2 open");
    wss2.send("wss2_handshake_sent_from_client");
    
  });

  wss2.addEventListener('close', (event) => {

    console.log(ts()+"safety3tclfork.js wss2 close, clearInterval(fileLogManage_clear)");
    
    clearInterval(fileLogManage_clear);
    
    wss2 = null;
    
    setTimeout(function(){ // try to reconnect after a delay

      wss2_start();
         
    }, cfgObj.reconnect_mSec);

  });

  wss2.addEventListener('error', (event) => {
    
    console.log(ts()+"safety3tclfork.js wss2 error", {event});
    
  });

  wss2.addEventListener('message', (event) => {
    
    //console.log(ts()+"safety3tclfork.js wss2 message from server: ", event.data);
    //console.log(ts()+"safety3tclfork.js wss2 message length from server: ", event.data.length);
    
    var jsonObj   = {};
    
    try {
      
      jsonObj = JSON.parse(event.data.toString());
      console.log(ts()+"safety3tclfork.js wss2 message JSON ok", {jsonObj});
    }
    catch (err) {
      console.log(ts()+"safety3tclfork.js wss2 message not JSON err: ", err);
      return;
    }    

    if (jsonObj.cmd == "write-ack") {
      
      console.log(ts()+"safety3tclfork.js wss2 write-ack received length: %s", jsonObj.length);
      
      fileLogDelete(jsonObj.filename);

    }

    if (jsonObj.cmd == "write-exists") {
      
      console.log(ts()+"safety3tclfork.js wss2 write-exists", {jsonObj});
      
      fileLogDelete(jsonObj.fn);

    }

    if (jsonObj.cmd == "checkExistsReply") {
      
      console.log(ts()+"safety3tclfork.js wss2 checkExistsReply", {jsonObj});
      
      if (jsonObj.status == true) {
        fileLogDelete(jsonObj.fn);
      }
      else {
        fileUpload(jsonObj.fn, "resend");
        //jsonObj.ts_resend = ts1(); // reset jsonObj.ts_resend in case resend attempt is not successful
        //fileLogWriteObj(jsonObj);  // save entire jsonObj
      }

    }

  }); //  wss2.addEventListener('message'

} // function wss2_start()

wss2_start();
