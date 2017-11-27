fs = require('fs');


fs.readFile('frame.264',function(err,data){
  if (err){
    return console.log(err);
  }
  var frames = data.split('\n');
  for (var i in frames){
    console.log('frame '+i+' :');
    console.log(frames[i]);
  }

});
