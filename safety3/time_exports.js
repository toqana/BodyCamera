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

//console.log("time_exports.js START at : %s", new Date());

if(Object.getOwnPropertyNames(Date.prototype).includes('YYYYMMDDHHMMSSmmm')){ // ok
  
  //console.log("time_exports.js value 'YYYYMMDDHHMMSSmmm' exists in Date.prototype");
  
} else {
  
  //console.log("time_exports.js value 'YYYYMMDDHHMMSSmmm' does not exist in Date.prototype, add it now");

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

} // YYYYMMDDHHMMSSmmm

if(Object.getOwnPropertyNames(Date.prototype).includes('YYYYMMDDHHMMSS')){ // ok
  
  //console.log("time_exports.js value 'YYYYMMDDHHMMSS' exists in Date.prototype");
  
} else {
  
  //console.log("time_exports.js value 'YYYYMMDDHHMMSS' does not exist in Date.prototype, add it now");

  Object.defineProperty(Date.prototype, 'YYYYMMDDHHMMSS', {
    
    value: function() {
      
      function pad2(n) {  // always returns a string
        return (n < 10 ? '0' : '') + n;
      }
          
      return this.getFullYear() + '-' +
         pad2(this.getMonth() + 1) + '-' +
         pad2(this.getDate()) + '_' +
         pad2(this.getHours()) + ':' +
         pad2(this.getMinutes()) + ':' +
         pad2(this.getSeconds());
    }
  });

} // YYYYMMDDHHMMSS

//
// function ts()
//

try {
  console.log("time_exports.js try, exists: ts(): ", ts());
}
catch (err){
  
  //console.log("time_exports.js catch function ts() does not exist, create it now");
  //console.log("time_exports.js catch ts() err: ", err);
  
  var ts = function () {
    return new Date().YYYYMMDDHHMMSSmmm() + " : ";
  }
  
}
//console.log(ts()+"time_exports.js ts() after after try/catch: '%s'", ts());

//
// function ts1()
//

try {
  console.log(ts()+"time_exports.js try, exists: ts1(): ", ts1());
}
catch (err){
  
  //console.log(ts()+"time_exports.js catch function ts1() does not exist, create it now");
  //console.log(ts()+"time_exports.js catch ts1() err: ", err);
  
  var ts1 = function () {
    return new Date().YYYYMMDDHHMMSSmmm();
  }
  
}
//console.log(ts()+"time_exports.js ts1() after after try/catch: ", ts1());

//
// function ts2(unix_time_mSec)
//

var unix_time_mSec = new Date().getTime(); // e.g. 1642108619535
//console.log(ts()+"time_exports.js unix_time_mSec: ", unix_time_mSec);

try {
  console.log(ts()+"time_exports.js try, eunix_time_mSecists: ts2(unix_time_mSec): ", ts2(unix_time_mSec));
}
catch (err){
  
  //console.log(ts()+"time_exports.js catch function ts2(unix_time_mSec) does not exist, create it now");
  //console.log(ts()+"unix_time_exports.js catch ts2(unix_time_mSec) err: ", err);
  
  var ts2 = function (unix_time_mSec) {
    return new Date(unix_time_mSec).YYYYMMDDHHMMSSmmm();
  }
  
}
//console.log(ts()+"time_exports.js ts2(unix_time_mSec) after after try/catch: ", ts2(unix_time_mSec));

//
// function ts3(ts_mSec) create new Date object from ts1() format e.g. 2022-01-13_13:04:47.410 
//

var ts_mSec = ts1(); // e.g. 2022-01-13_13:04:47.410
//console.log("time_exports.js ts_mSec: ", ts_mSec);

try {
  console.log(ts()+"time_exports.js try, exists: ts3(ts_mSec): ", ts3(ts_mSec));
}
catch (err){
  
  //console.log(ts()+"time_exports.js catch function ts3(ts_mSec) does not exist, create it now");
  //console.log(ts()+"time_exports.js catch ts3(ts_mSec) err: ", err);
  
  var ts3 = function (ts_mSec) {
    
    var arrYH = ts_mSec.split("_");
    //console.log("time_exports.js ts3(ts_mSec) arrYH:\n", arrYH);
    
    var arrY  = arrYH[0].split("-");
    //console.log("time_exports.js ts3(ts_mSec) arrY:\n", arrY);
    
    var arrH  = arrYH[1].split(":");
    //console.log("time_exports.js ts3(ts_mSec) arrH:\n", arrH);
    
    var arrS  = arrH[2].split(".");
    //console.log("time_exports.js ts3(ts_mSec) arrS:\n", arrS);
    
    return new Date(arrY[0], arrY[1]-1, arrY[2], arrH[0], arrH[1], arrS[0], arrS[1]);
    
  }
  
}
//console.log(ts()+"time_exports.js ts3(ts_mSec) after after try/catch: ", ts3(ts_mSec));

//
// function tsDTnow()
//

try {
  console.log(ts()+"time_exports.js try, exists: tsDTnow(): ", tsDTnow());
}
catch (err){
  
  //console.log(ts()+"time_exports.js catch function tsDTnow() does not exist, create it now");
  //console.log(ts()+"time_exports.js catch tsDTnow() err: ", err);
  
  var tsDTnow = function () {
    return new Date().YYYYMMDDHHMMSS();
  }
  
}
//console.log(ts()+"time_exports.js tsDTnow() after after try/catch: ", tsDTnow());

//
// function tsDT(unix_time_mSec)
//

try {
  console.log(ts()+"time_exports.js try, exists: tsDT(): ", tsDT(tsDTnow));
}
catch (err){
  
  //console.log(ts()+"time_exports.js catch function tsDT() does not exist, create it now");
  //console.log(ts()+"time_exports.js catch tsDT() err: ", err);
  
  var tsDT = function (unix_time_mSec) {
    return new Date().YYYYMMDDHHMMSS();
  }
  
}
//console.log(ts()+"time_exports.js tsDT(unix_time_mSec) after after try/catch: ", tsDT(unix_time_mSec));

//
// function DO_tsDT(tsDT) (Date Object from tsDT)
//

try {
  console.log(ts()+"time_exports.js try, exists: DO_tsDT(): ", DO_tsDT());
}
catch (err){
  
  //console.log(ts()+"time_exports.js catch function DO_tsDT() does not exist, create it now");
  //console.log(ts()+"time_exports.js catch DO_tsDT() err: ", err);
  
  var DO_tsDT = function (ts_Sec) {
    
    var arrYH = ts_Sec.split("_");
    //console.log("time_exports.js DO_tsDT(tsDT) arrYH:\n", arrYH);
    
    var arrY  = arrYH[0].split("-");
    //console.log("time_exports.js DO_tsDT(tsDT) arrY:\n", arrY);
    
    var arrH  = arrYH[1].split(":");
    //console.log("time_exports.js DO_tsDT(tsDT) arrH:\n", arrH);
    
    var arrS  = arrH[2].split(".");
    //console.log("time_exports.js DO_tsDT(tsDT) arrS:\n", arrS);
    
    return new Date(arrY[0], arrY[1]-1, arrY[2], arrH[0], arrH[1], arrS[0], 0);
    
  }
  
}
//console.log(ts()+"time_exports.js DO_tsDT(unix_time_mSec) after after try/catch: ", DO_tsDT(tsDTnow()));

//
// exports
//

exports.ts        = ts;
exports.ts1       = ts1;
exports.ts2       = ts2;
exports.ts3       = ts3;
exports.tsDTnow   = tsDTnow;
exports.tsDT      = tsDT;
exports.DO_tsDT   = DO_tsDT;

console.log(ts()+"time_exports.js END");
