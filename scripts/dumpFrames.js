Zcam = require('..');
fs = require('fs');

var zcam = new Zcam({ip:'10.98.32.1',streamingPort:'9999'});

var i=0;

fileStream = fs.createWriteStream('frame.264');
if (!fileStream){
  return console.log('file cannot be opened for stream');
}

var listener = function(frame){
  fileStream.write(frame,function(err){
    if (err){
      return console.log(err);
    }
    i++;
  });
};

zcam.initStreaming(listener,function(){
  setInterval(function(){
    zcam.requestFrame();
  },1000/30);
});

setInterval(function(){
  console.log(i + ' frames written.');
},1000);
