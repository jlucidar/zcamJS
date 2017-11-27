Zcam = require('..');
fs = require('fs');

var zcam = new Zcam();


fs.open('frame.264','a',function(err,fd){
  if (err){
    return console.log(err);
  }

    var i =0;
    var listener = function(frame){
      i++;

      fs.write(fd,frame,function(err){
        if (err){
          return console.log(err);
        }
        console.log('trame ' + i + ' written.');
      });
    };

    zcam.initStreaming(listener,function(){
      setInterval(zcam.requestFrame.bind(zcam),1000/10);
    });

});
