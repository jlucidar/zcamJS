Zcam = require('.');
fs = require('fs');

var zcam = new Zcam();
zcam.getInfo(console.log);

zcam.getTemperature(console.log);

zcam.getTimelapsePictureCount(console.log);

zcam.startSession(console.log);

zcam.stopSession(console.log);

zcam.setDate(console.log);

zcam.getMode(console.log);

zcam.getSettingInfo('hdmi_fmt',console.log);
zcam.getSetting('hdmi_fmt',console.log);
/*
var i=0;
var listener = function(data){
  console.log('trame '+ i++ +' received. length : ' +data.length);
}

zcam.initStreaming(listener,function(){
  setInterval(zcam.requestFrame.bind(zcam),1000);
});
*/
