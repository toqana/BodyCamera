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

const url                         = require("url");
const http                        = require("http");
const WebSocket                   = require("ws");

//
// sdcard
//

var sdcard = "sdcard-not-defined";

try {
  sdcard = fs.readlinkSync("../storage/external-1"); // your device may require a different link
  console.log(ts()+"safety3tcl.js sdcard SUCCESS", {sdcard});
}
catch (err) {
  console.log(ts()+"safety3tcl.js sdcard ERROR process.exit()", {err});
  process.exit();
}

//
// cfgObj
//

var cfgObj                = {};

cfgObj.TZ                 = process.env.TZ; // for safety3-browser.js

cfgObj.browserDebug       = false;
//cfgObj.browserDebug       = true;

cfgObj.browserShowDebug   = false;
//cfgObj.browserShowDebug   = true;

cfgObj.sdcard             = sdcard;

//cfgObj.clientVideo       = sdcard + "/safety/video/";
cfgObj.clientVideo       = process.cwd() + "/video/"; // internal memory

cfgObj.fileLog            = cfgObj.clientVideo + "file.log";

//cfgObj.geoLog             = sdcard + "/safety/video/geolocation.log"
cfgObj.geoLog             = cfgObj.clientVideo + "geolocation.log"; // internal memory

cfgObj.audioBitsPerSecond = 128000;
cfgObj.videoBitsPerSecond = 2500000;
cfgObj.mimeType           = "video/webm";

cfgObj.timeslice          = 82*1;  // about 0.1 seconds
cfgObj.ws4cntMax          = 100*1; // about 10 seconds

cfgObj.utfDebug           = false;
//cfgObj.utfDebug           = true;

cfgObj.fileLogManage_mSec  = 3000;
cfgObj.fileLogTimeout_mSec = cfgObj.fileLogManage_mSec *3;

cfgObj.reconnect_mSec      = 10000;

cfgObj.wss2ServerDomain   = "AudioClassify.com";  // ottmod YOURDOMAIN.com
cfgObj.wss2ServerPort     = 3003;                 // you can designate a different port for wss to server
cfgObj.wss2ServerChannel  = "data";

cfgObj.ws3ServerDomain    = "localhost";  // for android phone or tablet
cfgObj.ws3ServerPort      = 3004;         // you can designate a different port for ws to localhost
cfgObj.ws3ServerChannel   = "control";

cfgObj.ws4ServerDomain    = "localhost";  // for android phone or tablet
cfgObj.ws4ServerPort      = 3005;         // you can designate a different port for ws to localhost
cfgObj.ws4ServerChannel   = "data";

//cfgObj.ws3debug           = true;
cfgObj.ws3debug           = false;

//cfgObj.ws4debug           = true;
cfgObj.ws4debug           = false;

cfgObj.audioBitsPerSecond = 128000; // https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/audioBitsPerSecond
cfgObj.videoBitsPerSecond = 2500000;
cfgObj.mimeType           = "video/webm";

process.env.cfgStr        = JSON.stringify(cfgObj);

//
// create pw_hash offline (do NOT store clear password in your application)
//

//const crypto                      = require('crypto')
//var pw_hash = crypto.createHash('md5').update('bsafe').digest('hex'); // only store pw_hash in your application

var pw_hash = "01ea8ae5798aeb3ed63b78c99f889dfb";
//console.log(ts()+"pw_hash: %s", pw_hash);

//
// express webserver on localhost
//

const port              = 3001; // you can designate a different port for http
const domain            = "localhost";
const webapp            = "safety3";
const prog              = "safety3tcl.js";

const express           = require('express');
const webserver         = express();

const bodyParser        = require('body-parser');

webserver.use(bodyParser.urlencoded({ extended: true }));
webserver.use(express.json());
webserver.use(express.static('public'));

webserver.engine('ntl', function (filePath, options, callback) {
  getPage(filePath, options, callback);
});

webserver.set('views', './views');
webserver.set('view engine', 'ntl');

webserver.listen(port, () => {
  
  console.log(ts()+"%s webserver ready at http://%s:%s/%s", prog, domain, port, webapp);
    
});

function getPage(filePath, options, callback){
  
  console.log(ts()+"safety3wss.js getPage() filePath: ", filePath);
  console.log(ts()+"safety3wss.js getPage() options:\n", options);
  
  fs.readFile(filePath, function (err, content) {

    if (err) {
      return callback(new Error(err.message));
    }

    var rendered = content.toString();
    
    rendered = rendered.replace(/\{\{cfgStr\}\}/g, JSON.stringify(cfgObj));
    
    return callback(null, rendered);
    
  }); // fs.readFile
  
} //  getPage

webserver.get('/safety3', (req, res) => {
  
  console.log(ts()+"safety3wss.js get /safety2");
  
  let options = {};
  
  res.render('safety3', options);

}); // webserver.get('/safety'

//
// process.exit() via SIGINT or SIGTERM
//

process.on('SIGINT', function(){
  
  console.log();
  console.log();
  console.log(ts()+"safety3tcl.js process.on('SIGINT' (e.g. 'CTRL-C') -> process.exit()");
  console.log();
  
  process.exit();  

});

process.on('SIGTERM', function(){
  
  console.log();
  console.log();
  console.log(ts()+"safety3tcl.js process.on('SIGTERM' (e.g. 'kill') -> process.exit()");
  console.log();
  
  process.exit();  

});

//
// uncaughtException
//

process.on('uncaughtException', err => {
  
  console.log(ts()+"safety3tcl.js FATAL ERROR process.on('uncaughtException' err:\n", err);
  console.log();
  process.exit(1); // mandatory (as per the Node.js docs)
  
});

//
// TCL ws3 (control)
//

function ws3Server() {
  
  console.log(ts()+"safety3tcl.js ws3Server cfgObj:\n", cfgObj);
  
  var server_ws3 = "server_ws3-not-defined";
  try {
    server_ws3    = http.createServer();
    console.log(ts()+"safety3tcl.js ws3Server ready at ws://%s:%s/%s", cfgObj.ws3ServerDomain, cfgObj.ws3ServerPort, cfgObj.ws3ServerChannel);
  }
  catch (err) {
    console.log(ts()+"safety3tcl.js ERROR server_ws3 err:\n", err);
  }
  
  var ws3 = new WebSocket.Server({ noServer: true });
  
  if (cfgObj.ws3debug) {
    console.log(ts()+"safety3tcl.js ws3Server ws3:\n", ws3);
  }
  
  //
  // ws3 ws3ServerChannel
  //

  ws3.on('connection', function connection(ws) {
    
    if (cfgObj.ws3debug) {
      console.log(ts()+"safety3tcl.js ws3.on('connection') ws:\n", ws); // unique for each webpage connection
      console.log(ts()+"safety3tcl.js ws3.on('connection') typeof ws:", typeof ws);
    }

    ws.on('message', function incoming(message) {

      if(cfgObj.ws3debug){
        console.log(ts()+"safety3tcl.js received ws3 ws.on(message: %s", message);
        //console.log(ts()+"safety3tcl.js ws3 ws.on(message.toString(): ", message.toString());
      }

      //
      // ws3ServerChannel
      //
      
      var jsonObj   = {};
      
      try {
        
        jsonObj = JSON.parse(message.toString());
               
      }
      catch (err) {
        console.log(ts()+"safety3tcl.js ws3 message not JSON err: ", err);
        return;
      }

      if(jsonObj.cmd == "ws3_browser_handshake_sent"){

        console.log(ts()+"safety3tcl.js received: ws3_browser_handshake_sent");
        ws.send(JSON.stringify({"cmd":"ws3_browser_handshake_received"}));
        console.log(ts()+"safety3tcl.js sent: ws3_browser_handshake_received");
        
        return;
        
      } // if(jsonObj.cmd == "ws3_browser_handshake_sent")

      if(jsonObj.cmd == "auth_request"){
        
        //console.log(ts()+"safety3tcl.js ws3 auth_request jsonObj.pw_hash: %s, pw_hash", jsonObj.pw_hash, pw_hash);
        
        if(jsonObj.pw_hash == pw_hash){

          ws.send(JSON.stringify({"auth_status":"auth_ok"}));
          
        } else {
          
          ws.send(JSON.stringify({"auth_status":"auth_reject"}));
          
        }
        
        return;
        
      } // if(jsonObj.cmd == "auth_request")

      if(jsonObj.cmd == "geolocation") {
        
        //console.log(ts()+"safety3tcl.js ws3 jsonObj.cmd == geolocation", {jsonObj});
        
        fs.appendFile(cfgObj.geoLog, message + "\n", 'utf8',

          function(err) { 
                
              if (err) {
                
                console.log(ts()+"safety.js ERROR geolocation message append err: ", err);
                
              } else { // if no error
              
                if (cfgObj.ws3debug) {
                  console.log(ts()+"safety.js SUCCESS geolocation message append");
                }
                
                childProcess.send({"ts":ts1(),"cmd":"geolocation-update","filename":cfgObj.geoLog});
                
              }
        });         

      } // if(jsonObj.cmd == "geolocation")
            
    }); // ws.on('message'

    ws.addEventListener('close', (event) => {
      
      console.log(ts()+"safety3tcl.js ws3 ws.addEventListener(close)");
      
      if (cfgObj.ws3debug) {
        console.log(ts()+"safety3tcl.js ws3 ws.addEventListener(close) event:\n", event);
        console.log(ts()+"safety3tcl.js ws3 ws.addEventListener(close) util.inspect(event):\n", util.inspect(event, { showHidden: true, depth: null }));
        console.log(ts()+"safety3tcl.js ws3 ws.addEventListener(close) util.inspect(event):\n", util.inspect(event));
      }
      
    }); // ws.addEventListener('close'

  }); // ws3.on('connection', function connection(ws) {
  
  //
  // upgrade to websockets
  //

  server_ws3.on('upgrade', function upgrade(request, socket, head) {

    const pathname = url.parse(request.url).pathname;

    console.log(ts()+'safety3tcl.js ws3 attempt upgrade pathname: %s', pathname);

    if (pathname === "/" + cfgObj.ws3ServerChannel) {

      //
      // if required, call function here
      //

      ws3.handleUpgrade(request, socket, head, function done(ws) {
        ws3.emit('connection', ws, request);
      });

      console.log(ts()+'safety3tcl.js ws3 upgraded pathname: %s', pathname);

    } else {
      socket.destroy();
    }
  
  });

  server_ws3.listen(cfgObj.ws3ServerPort);

} // function ws3Server()

ws3Server();

//
// TCL ws4 (data)
//

var ws4file    = "ws4file-not-defined";

function ws4Server() {
  
  console.log(ts()+"safety3tcl.js ws4Server cfgObj:\n", cfgObj);
  
  var server_ws4 = "server_ws4-not-defined";
  try {
    server_ws4    = http.createServer();
    console.log(ts()+"safety3tcl.js ws4Server ready at ws://%s:%s/%s", cfgObj.ws4ServerDomain, cfgObj.ws4ServerPort, cfgObj.ws4ServerChannel);
  }
  catch (err) {
    console.log(ts()+"safety3tcl.js ERROR server_ws4 err:\n", err);
  }
  
  var ws4 = new WebSocket.Server({ noServer: true });
  if(cfgObj.ws4debug){console.log(ts()+"safety3tcl.js ws4Server ws4:\n", ws4);}
  
  //
  // ws4 ws4ServerChannel
  //

  ws4.on('connection', function connection(ws) {
    
    if (cfgObj.ws4debug) {
      console.log(ts()+"safety3tcl.js ws4.on('connection') ws:\n", ws); // unique for each webpage connection
      console.log(ts()+"safety3tcl.js ws4.on('connection') typeof ws:", typeof ws);
    }

    ws.on('message', function incoming(message) {

      if (message == "ws4_browser_handshake_sent") {
        
        console.log(ts()+"safety3tcl.js receieved: ws4_browser_handshake_sent");
        ws.send("ws4_browser_handshake_received");
        console.log(ts()+"safety3tcl.js sent: ws4_browser_handshake_received");
      
      } else { // video data

        if (cfgObj.ws4debug) {
          console.log(ts()+"safety3tcl.js ws4 typeof message: ", typeof message); // object
          console.log(ts()+"safety3tcl.js ws4 message\n", {message});
          console.log(ts()+"safety3tcl.js ws4 message[0]: ", message[0]);
          console.log(ts()+"safety3tcl.js ws4 message[0].toString(16): ", message[0].toString(16));
          console.log(ts()+"safety3tcl.js ws4 message.length: ", message.length);
        }
        
        //
        // look for webm header (start of new file)
        //
        
        if (message.includes("webm")) {
          
          if (cfgObj.ws4debug) {
            console.log(ts()+"safety3tcl.js message.includes(webm)");
            console.log(ts()+"safety3tcl.js message.includes(webm) message[24]", message[24]);
            console.log(ts()+"safety3tcl.js message.includes(webm) message[24].toString(16)", message[24].toString(16));
            console.log(ts()+"safety3tcl.js message.includes(webm) message.length: ", message.length);
          }
          
          if (message[24] == "0x77" && 
              message[25] == "0x65" && 
              message[26] == "0x62" && 
              message[27] == "0x6d") {
            
            if (cfgObj.ws4debug) {
              console.log(ts()+"safety3tcl.js 'webm' position OK");        
            }
          
          } else {
            
            if (message[0] != "0x1a") {
              
              const SUB = Buffer.alloc(1, 0x1a, 'utf8');
              
              message = Buffer.concat([SUB, message]);
              
              if (cfgObj.ws4debug) {
                console.log(ts()+"safety3tcl.js after concat message\n", {message});
                console.log(ts()+"safety3tcl.js after concat message.length: ", message.length);
              }
                    
            }      
              
          }
          
          if (ws4file.includes("webm")) { // first file has been created
            childProcess.send({"ts":ts1(),"cmd":"webm-found","filename":ws4file});
          }
          
          ws4file = createFilename("webm");
          
        }
          
        try {
          
          fs.appendFileSync(ws4file, message, 'utf8');
          
          if (cfgObj.ws4debug) {
            console.log(ts()+"safety3tcl.js SUCCESS message fs.appendFileSync()");
          }

        }
        catch (err) {
          console.log(ts()+"safety3tcl.js ERROR message append err: ", err);
        }
      
      } // else (video data)

    }); // ws.on('message'

    ws.addEventListener('close', (event) => {
      
      console.log(ts()+"safety3tcl.js ws4 ws.addEventListener(close)");
      
      if (cfgObj.ws4debug) {
        console.log(ts()+"safety3tcl.js ws4 ws.addEventListener(close) event:\n", event);
        console.log(ts()+"safety3tcl.js ws4 ws.addEventListener(close) util.inspect(event):\n", util.inspect(event, { showHidden: true, depth: null }));
        console.log(ts()+"safety3tcl.js ws4 ws.addEventListener(close) util.inspect(event):\n", util.inspect(event));
      }
      
    }); // ws.addEventListener('close'

  }); // ws4.on('connection', function connection(ws) {
  
  //
  // upgrade to websockets
  //

  server_ws4.on('upgrade', function upgrade(request, socket, head) {

    const pathname = url.parse(request.url).pathname;

    console.log(ts()+'safety3tcl.js ws4 attempt upgrade pathname: %s', pathname);

    if (pathname === "/" + cfgObj.ws4ServerChannel) {

      //
      // if required, call function here
      //

      ws4.handleUpgrade(request, socket, head, function done(ws) {
        ws4.emit('connection', ws, request);
      });

      console.log(ts()+'safety3tcl.js ws4 upgraded pathname: %s', pathname);

    } else {
      socket.destroy();
    }
  
  });

  server_ws4.listen(cfgObj.ws4ServerPort);

} // function ws4Server()

ws4Server();


//console.log(ts()+"safety3tcl.js process.exit()");
//process.exit();


function createFilename(ext) {
  
  //
  // create filename YYYY-MM-DD_HH-II-SS.wav
  //
  
  var now  = new Date();
  //console.log(ts()+"safety3tcl.js createFilename()", {now});
  
  var YYYY = now.getFullYear().toString();
  //console.log(ts()+"safety3tcl.js createFilename()", {YYYY});
  
  var MM   = (now.getMonth() + 1).toString().padStart(2, "0");
  //console.log(ts()+"safety3tcl.js createFilename()", {MM});
  
  var DD   = now.getDate().toString().padStart(2, "0");
  //console.log(ts()+"safety3tcl.js createFilename()", {DD});
  
  var HH   = now.getHours().toString().padStart(2, "0");
  //console.log(ts()+"safety3tcl.js createFilename()", {HH});
  
  var II   = now.getMinutes().toString().padStart(2, "0");
  //console.log(ts()+"safety3tcl.js createFilename()", {II});
  
  var SS   = now.getSeconds().toString().padStart(2, "0");
  //console.log(ts()+"safety3tcl.js createFilename()", {SS});
  
  var fn = cfgObj.clientVideo + YYYY + "-" + MM + "-" + DD + "_" + HH + "-" + II + "-" + SS + "." + ext;
  console.log(ts()+"safety3tcl.js createFilename()", {fn});
  
  return fn;
  
} // createFilename(ext)

//
// childProcess
//

var childProcess = fork("safety3tclfork.js");

childProcess.send({"ts":ts1(),"cmd":"msg-from-parent"});

childProcess.on('message', (msg) => {
  
  console.log(ts()+"safety3tcl.js childProcess.on('message'", {msg});
  
});
