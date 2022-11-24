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

process.env.TZ                    = "America/Los_Angeles"; // use your timezone in all js files

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

//console.log(ts()+"safety3wss.js DEBUG process.exit()");
//process.exit(); 

//
// cfgObj
//

var wss2cnt               = 0*1;

var cfgObj                = {};

cfgObj.browserDebug       = false;
cfgObj.browserShowDebug   = false; 

//
// WebSocket init
//

const url                         = require("url");

cfgObj.wss1ServerDomain   = "AudioClassify.com";  // ottmod YOURDOMAIN.com
cfgObj.wss1ServerPort     = 3002;                 // you can designate a different port for wss to client
cfgObj.wss1ServerChannel  = "control";

cfgObj.wss2ServerDomain   = "AudioClassify.com";  // ottmod YOURDOMAIN.com
cfgObj.wss2ServerPort     = 3003;                 // you can designate a different port for wss to client
cfgObj.wss2ServerChannel  = "data";

cfgObj.utfDebug           = false;
//cfgObj.utfDebug           = true;

const WebSocket           = require("ws");
const https               = require("https");

//
// copy the server SSL cert for wss1 and wss2 or create a new SSL cert
//
// this code is based on Ubuntu 22 with Letsencrypt (certbot) SSL certs
//

var root_key_wss_file     = "/etc/letsencrypt/live/" + cfgObj.wss1ServerDomain.toLowerCase() + "/privkey.pem";
var root_cert_wss_file    = "/etc/letsencrypt/live/" + cfgObj.wss1ServerDomain.toLowerCase() + "/cert.pem";

var nodejs_key_wss_file   = process.cwd() + "/privkey.pem";
var nodejs_cert_wss_file  = process.cwd() + "/cert.pem";

try {
  execSync("sudo cp " + root_key_wss_file + " " + nodejs_key_wss_file);
  execSync("sudo cp " + root_cert_wss_file + " " + nodejs_cert_wss_file);
  execSync("sudo chown nodejs:nodejs " + nodejs_key_wss_file);
  execSync("sudo chown nodejs:nodejs " + nodejs_cert_wss_file);
}
catch (err) {
  console.error(ts()+"catch (err) ", {err});
  process.exit();  
}

//console.log(ts()+"safety3wss.js DEBUG process.exit()");
//process.exit(); 

//
// process.exit() via SIGINT or SIGTERM
//

process.on('SIGINT', function(){
  
  console.log();
  console.log();
  console.log(ts()+"safety3wss.js process.on('SIGINT' (e.g. 'CTRL-C') -> process.exit()");
  console.log();
  
  process.exit();  

});

process.on('SIGTERM', function(){
  
  console.log();
  console.log();
  console.log(ts()+"safety3wss.js process.on('SIGTERM' (e.g. 'kill') -> process.exit()");
  console.log();
  
  process.exit();  

});

//
// uncaughtException
//

process.on('uncaughtException', err => {
  
  console.log(ts()+"safety3wss.js FATAL ERROR process.on('uncaughtException' err:\n", err);
  console.log();
  process.exit(1); // mandatory (as per the Node.js docs)
  
});

//
// wss2 (data)
//

const wss2debug           = true;
//const wss2debug           = false;

var wss2file              = "wss2file-not-defined";

var wss2;
var socket2;

function wss2Server() {
  
  console.log(ts()+"safety3wss.js wss2Server", {cfgObj});
  
  var server_wss2 = "server_wss2-not-defined";

  try {
    
    server_wss2    = https.createServer({
      key:  fs.readFileSync(nodejs_key_wss_file),
      cert: fs.readFileSync(nodejs_cert_wss_file)
    });
    
    console.log(ts()+"safety3wss.js server_wss2 ready at wss://%s:%s/%s", cfgObj.wss2ServerDomain, cfgObj.wss2ServerPort, cfgObj.wss2ServerChannel);
  
  }
  catch (err) {
    console.log(ts()+"safety3wss.js ERROR server_wss2 err:\n", err);
  }
  
  wss2 = new WebSocket.Server({ noServer: true });
  if(wss2debug){console.log(ts()+"safety3wss.js wss2Server wss2:\n", wss2);}
  
  //
  // wss2 wss2ServerChannel
  //

  wss2.on('connection', function connection(ws2) {
    
    socket2 = ws2;
    
    //if(wss2debug){console.log(ts()+"safety3wss.js wss2.on('connection') ws:\n", ws2);} // unique for each webpage connection
    //if(wss2debug){console.log(ts()+"safety3wss.js wss2.on('connection') typeof ws2:", typeof ws2);}

    ws2.on('message', function incoming(message) {

      if (message == "wss2_handshake_sent_from_client") {
        
        console.log(ts()+"safety3wss.js wss2_handshake_sent_from_client");
        //ws2.send("wss2_handshake_received_by_server");
        ws2.send(JSON.stringify({"wss2-server-ack":"wss2_handshake_received_by_server"}));
      
      } else {

        //
        // verify data is json
        //

        var jsonObj   = {};
        
        try {
          jsonObj = JSON.parse(message.toString());
        }
        catch (err) {
          console.log(ts()+"safety3wss.js wss2 message not JSON err: ", err);
          process.exit();
        }

        if(jsonObj.cmd == "file-upload") {
          
          console.log(ts()+"safety3wss.js wss2 file-upload %s, %s, %s, %s", jsonObj.cmd, jsonObj.fn, jsonObj.fn_length, jsonObj.attempt);

          let filename = process.cwd() + "/video/" + jsonObj.fn;
          //console.log(ts()+"safety3wss.js wss2 file-upload filename: ", filename);
                    
          let fileData = jsonObj.fileData;
          //console.log(ts()+"safety3wss.js wss2 file-upload typeof fileData: %s", typeof fileData);
          
          if (fs.existsSync(filename)) {
            
            console.log(ts()+"safety3wss.js wss2 file-upload fs.existsSync(%s), jsonObj.fn_length: %s, fs.statSync(filename).size: %s", filename, jsonObj.fn_length, fs.statSync(filename).size);

            let client_length = jsonObj.fn_length;
            let server_length = fs.statSync(filename).size;
            console.log(ts()+"safety3wss.js wss2 file-upload client_length: %s, server_length: %s", client_length, server_length);

            if (cfgObj.utfDebug) {
              let fileData   = fs.readFileSync(filename, {encoding:'utf16le'});
              let fn_length  = fs.statSync(filename).size;
              //console.log(ts()+"safety3wss.js wss2 file-upload fn_length: %s, fileData[0]: %s, fileData[fileData.length - 1]: %s", fn_length, fileData[0].toString('utf16le'), fileData[fileData.length - 1].toString('utf16le'));
              console.log(ts()+"safety3wss.js wss2 file-upload fn_length: %s, fileData[0]: %s, fileData[fileData.length - 1]: %s", fn_length, bytesToHex(stringToUTF16Bytes(fileData[0], false)), bytesToHex(stringToUTF16Bytes(fileData[fileData.length - 1], false)));
              console.log(ts()+"safety3wss.js wss2 file-upload fn_length: %s, fileData[0]: %s, fileData[fileData.length - 1]: %s", fn_length, bytesToHex(stringToUTF16Bytes(fileData[0], true)), bytesToHex(stringToUTF16Bytes(fileData[fileData.length - 1], true)));
            }

            //
            // ascii sub char (0x1a) may be added for padding which may affect file length
            //
            
            if (client_length == server_length || client_length == server_length + 1 || client_length == server_length - 1) {

              //
              // acknowledge writeFileSync to client, file exists with same file size
              //
            
              socket2.send(JSON.stringify({"cmd":"write-exists","filename":jsonObj.fn,"length":fs.statSync(filename).size}));
              console.log(ts()+"safety3wss.js wss2 file-upload write-exists attempt: %s, fn: %s", jsonObj.attempt, jsonObj.fn);
              
              return;
              
            }
            
          } // if (fs.existsSync(filename))

          try {
            
            fs.writeFileSync(filename, fileData, {encoding:'utf16le'});
            
            //
            // acknowledge writeFileSync to client
            //
          
            socket2.send(JSON.stringify({"cmd":"write-ack","filename":jsonObj.fn,"length":fs.statSync(filename).size}));
            console.log(ts()+"safety3wss.js wss2 file-upload write-ack attempt: %s, fn: %s SUCCESS", jsonObj.attempt, jsonObj.fn);
            
          }
          catch (err) {
            console.log(ts()+"safety3wss.js wss2 file-upload fs.writeFileSync ERROR", {err});
          }

        } // if(jsonObj.cmd == "file-upload")


        if (jsonObj.cmd == "checkExists") {
          
          console.log(ts()+"safety3wss.js wss2 checkExists", {jsonObj});
          
          let filename = process.cwd() + "/video/" + jsonObj.fn;
          console.log(ts()+"safety3wss.js wss2 checkExists filename: ", filename);
          
          if (fs.existsSync(filename)) {
            
            console.log(ts()+"safety3wss.js wss2 checkExists fs.existsSync(%s), fn: %s SUCCESS", filename, jsonObj.fn);
            
            let client_length = jsonObj.fn_length;
            let server_length = fs.statSync(filename).size;
            console.log(ts()+"safety3wss.js wss2 checkExists client_length: %s, server_length: %s", client_length, server_length);

            if (cfgObj.utfDebug) {
              let fileData   = fs.readFileSync(filename, {encoding:'utf16le'});
              let fn_length  = fs.statSync(filename).size;
              //console.log(ts()+"safety3wss.js wss2 checkExists fn_length: %s, fileData[0]: %s, fileData[fileData.length - 1]: %s", fn_length, fileData[0].toString('utf16le'), fileData[fileData.length - 1].toString('utf16le'));
              console.log(ts()+"safety3wss.js wss2 checkExists fn_length: %s, fileData[0]: %s, fileData[fileData.length - 1]: %s", fn_length, bytesToHex(stringToUTF16Bytes(fileData[0], false)), bytesToHex(stringToUTF16Bytes(fileData[fileData.length - 1], false)));
              console.log(ts()+"safety3wss.js wss2 checkExists fn_length: %s, fileData[0]: %s, fileData[fileData.length - 1]: %s", fn_length, bytesToHex(stringToUTF16Bytes(fileData[0], true)), bytesToHex(stringToUTF16Bytes(fileData[fileData.length - 1], true)));
            }

            //
            // ascii sub char (0x1a) may be added for padding may affect file length
            //
            
            if (client_length == server_length || client_length == server_length + 1 || client_length == server_length - 1) {
              socket2.send(JSON.stringify({"cmd":"checkExistsReply","fn":jsonObj.fn,"status":true}));
              console.log(ts()+"safety3wss.js wss2 checkExistsReply, sizes match, status: true, fn: %s, client_length: %s, server_length: %s", jsonObj.fn, client_length, server_length);
            }
            else {
              socket2.send(JSON.stringify({"cmd":"checkExistsReply","fn":jsonObj.fn,"status":false}));
              console.log(ts()+"safety3wss.js wss2 checkExistsReply, sizes not match, status: false, fn: %s, client_length: %s, server_length: %s", jsonObj.fn, client_length, server_length);            
            }
            
          }
          else { // filename does not exist
            socket2.send(JSON.stringify({"cmd":"checkExistsReply","fn":jsonObj.fn,"status":false}));
            console.log(ts()+"safety3wss.js wss2 checkExistsReply, filename does not exist, status: false, fn: %s", jsonObj.fn);              
          }      
          
        } // if (jsonObj.cmd == "checkExists")

        if(jsonObj.cmd == "geolocation-update") {
          
          let fileData = jsonObj.fileData;
          //console.log(ts()+"safety3wss.js wss2 geolocation-update typeof fileData: %s", typeof fileData);
          //console.log(ts()+"safety3wss.js wss2 geolocation-update fileData.length: %s", fileData.length);

          let filename = process.cwd() + "/video/" + jsonObj.filename;
          //console.log(ts()+"safety3wss.js wss2 geolocation-update file-upload filename: ", filename);

          try {
            fs.writeFileSync(filename, fileData, {encoding:'utf8'});
            console.log(ts()+"safety3wss.js wss2 geolocation-update fs.writeFileSync(%s) SUCCESS", filename);
          }
          catch (err) {
            console.log(ts()+"safety3wss.js wss2 geolocation-update fs.writeFileSync ERROR", {err});
          }

        } // if(jsonObj.cmd == "geolocation-update")

      } // else

    }); // ws.on('message'

    ws2.addEventListener('close', (event) => {
      
      console.log(ts()+"safety3wss.js wss2 ws.addEventListener(close)");
      //console.log(ts()+"safety3wss.js wss2 ws.addEventListener(close) event:\n", event);
      //console.log(ts()+"safety3wss.js wss2 ws.addEventListener(close) util.inspect(event):\n", util.inspect(event, { showHidden: true, depth: null }));
      //console.log(ts()+"safety3wss.js wss2 ws.addEventListener(close) util.inspect(event):\n", util.inspect(event));
      
      
    }); // ws2.addEventListener('close'

  }); // wss2.on('connection', function connection(ws2) {
  
  //
  // upgrade to websockets
  //

  server_wss2.on('upgrade', function upgrade(request, socket, head) {

    const pathname = url.parse(request.url).pathname;

    console.log(ts()+'safety3wss.js wss2 attempt upgrade pathname: %s', pathname);

    if (pathname === "/" + cfgObj.wss2ServerChannel) {

      //
      // if required, call function here
      //

      wss2.handleUpgrade(request, socket, head, function done(ws) {
        wss2.emit('connection', ws, request);
      });

      console.log(ts()+'safety3wss.js wss2 upgraded pathname: %s', pathname);

    } else {
      socket.destroy();
    }
  
  });

  server_wss2.listen(cfgObj.wss2ServerPort);

} // function wss2Server()

wss2Server();

//
// cfgObj.utfDebug utilities - start
//
// ascii sub char (0x1a) may be added for padding may affect file length
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

//
// remove old video files
//

console.log(ts()+"safety3wss.js START");

const videoFolder   = process.cwd() + "/video"; // 2022-09-14_01-02-03.webm
const percentMax    = 80;

async function clean(){
  
  console.log(ts()+"safety3wss.js async function clean() start");
  
  //
  // remove files of zero length
  //

  var zeroList = fs.readdirSync(videoFolder);
  //console.log(ts()+"safety3wss.js clean() zeroList.length: ", zeroList.length);

  var z = 0*1;
  zeroList.forEach(f => {  
    
    var stat = fs.statSync(videoFolder + "/" + f);
    //console.log(ts()+"safety3wss.js clean() zeroList stat: ", stat);

    if (stat.size == 0) {
      z++;
      fs.unlinkSync(videoFolder + "/" + f);
      //console.log(ts()+"safety3wss.js clean() zeroList unlinl(%s): ", videoFolder + "/" + f);
    }
     
  });
  
  console.log(ts()+"safety3wss.js clean() number of zero length files removed: ", z);

  //
  // remove old files if(percent > percentMax)
  //
  
  var cmd = "df -h | grep /dev/vda1";
  //var cmd = "df -h | grep /dev/block/dm-9";

  var str = execSync(cmd).toString();
  str = str.replace("\n","");
  str = str.replace(/\s+/g, " ");
  console.log(ts()+"safety3wss.js clean() str: %s", str);
  
  var arr = str.split(" ");
  //console.log(ts()+"safety3wss.js clean() arr: %s", arr);
  //console.log(ts()+"safety3wss.js clean() arr[4]: %s", arr[4]);
  
  var percent = arr[4].replace("%","");
  console.log(ts()+"safety3wss.js clean() percent: %s", percent);

  var dateArr = [];
  
  if(percent > percentMax){
    
    console.log(ts()+"safety3wss.js clean() percent (%s) > percentMax (%s): need to remove files", percent, percentMax);
    
    var list = fs.readdirSync(videoFolder);
  
    list.forEach(f => {
    
      try {
        var stat = fs.statSync(videoFolder + "/" + f);
        //console.log(ts()+"safety3wss.js clean() list stat: ", stat);
        var p = {"filename":videoFolder + "/" + f,"ctimeMs":stat.ctimeMs};
        dateArr.push(p);
        //console.log(ts()+"safety3wss.js clean() p: ", p)
      }
      catch (err) {
        console.log(ts()+"safety3wss.js clean() ERROR stat err: ", err);
        }
      
    }); // list.forEach
    
    dateArr.sort((a, b) => b.ctimeMs - a.ctimeMs); // most current is dateArr[0]
    //console.log(ts()+"safety3wss.js clean() dateArr: ", dateArr);
    console.log(ts()+"safety3wss.js clean() dateArr.length: ", dateArr.length);
    
    var offset = dateArr.length * (percentMax/100);
    offset = parseInt(offset, 10);
    //console.log(ts()+"safety3wss.js clean() offset: ", offset);
    
    for(var i = offset; i < dateArr.length; i++) {
      
      try {
        fs.unlinkSync(dateArr[i].filename);
        //console.log(ts()+"safety3wss.js clean() SUCCESS offset: %s, i: %s, fs.unlink(%s)", offset, i, dateArr[i].filename);
      }
      catch (err) {
        console.log(ts()+"safety3wss.js clean() ERROR fs.unlink err: ", err);
      }
      
    }
    
  } // if(percent > percentMax)
  else {
    console.log(ts()+"safety3wss.js clean() percent (%s) <= percentMax (%s): no need to remove files", percent, percentMax);
  }
  
} // function clean()

clean(); //  clean() at start

var cleanInterval = 60 * 60 * 1000; // clean() every hour

setInterval(function(){
  
  clean();
  
}, cleanInterval);
