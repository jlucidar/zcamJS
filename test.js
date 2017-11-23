Zcam = require('.');

var zcam = new Zcam();
zcam.getInfo(console.log);

zcam.getTemperature(console.log);

zcam.getTimelapsePictureCount(console.log);

zcam.startSession(console.log);

zcam.stopSession(console.log);

zcam.setDate(console.log);

zcam.getMode(console.log);

var listener = console.log
zcam.initStreaming(listener,function(){
  setInterval(zcam.requestFrame.bind(zcam),1000);
});
