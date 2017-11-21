var request = require('request');
var net = require('net');
var fs = require('fs');


function Zcam(options){
  options = options || {};

  options.ip = options.ip || "10.98.32.1";
  options.port = options.port || "80";
  options.streamingPort = options.streamingPort || 9876;
  options.DCIMFolder = options.DCIMFolder || '100MEDIA';

  this.endpoints = {};
  this.endpoints.root = "http://" + options.ip + ':' + options.port;
  this.endpoints.info = this.endpoints.root + '/info';
  this.endpoints.temperature = this.endpoints.root + '/ctrl/temperature';
  this.endpoints.timelapsePictureCount = this.endpoints.root + '/ctrl/timelapse_stat';
  this.endpoints.session = this.endpoints.root + '/ctrl/session';
  this.endpoints.uploadFirmware = this.endpoints.root + '/uploadfirmware';
  this.endpoints.upgrade = this.endpoints.root + '/ctrl/upgrade';
  this.endpoints.shutdown = this.endpoints.root + '/ctrl/shutdown';
  this.endpoints.reboot = this.endpoints.root + '/ctrl/reboot';
  this.endpoints.datetime = this.endpoints.root + '/datetime';
  this.endpoints.mode = this.endpoints.root + '/ctrl/mode';
  this.endpoints.listDCIMFolders = this.endpoints.root + '/DCIM';
  this.endpoints.filesManager = this.endpoints.root + '/DCIM/'+ options.DCIMFolder + ''
  this.endpoints.still = this.endpoints.root + '/ctrl/still';
  this.endpoints.movie = this.endpoints.root + '/ctrl/rec';
  this.endpoints.setting = this.endpoints.root + '/ctrl';
  this.endpoints.magnify = this.endpoints.root + '/ctrl/mag';

}

//get General Information about the camera (model, hardware and software version, serial number, bluetooth mac address, etc...)
Zcam.prototype.getInfo = function(callback){
  request.get({url:this.endpoints.info,json:true}, function (error, response, body) {
    if(error) return callback(error);
    this.info = body;
    callback(null,this);
  }.bind(this));
};


//return the temperqture in degree Celsius
Zcam.prototype.getTemperature = function(callback){
  request.get({url:this.endpoints.temperature,json:true}, function (error, response, body) {
    if(error) return callback(error);
    if(body.code!== 0) return callback(formatError(body));

    temperature = body.msg;

    callback(null,parseInt(temperature));
  }.bind(this));
};

// get the number of pictures taken during a timelapse Session
Zcam.prototype.getTimelapsePictureCount = function(callback){
  request.get({url:this.endpoints.timelapsePictureCount,json:true}, function (error, response, body) {
    if(error) return callback(error);
    if(body.code!== 0) return callback(formatError(body));

    timelapsePictureCount = body.msg;

    callback(null,parseInt(timelapsePictureCount));
  }.bind(this));
};

// lock a session (don't allow other people to control the cam) or do a heartbeat
Zcam.prototype.startSession = function(callback){
  request.get({url:this.endpoints.session,json:true}, function (error, response, body) {
    if(error) return callback(error);
    if(body.code!== 0) return callback(formatError(body));

    callback(null);
  }.bind(this));
};


// unlock the session
Zcam.prototype.stopSession = function(callback){
  request.get({url:this.endpoints.session + '?action=quit',json:true}, function (error, response, body) {
    if(error) return callback(error);
    if(body.code!== 0) return callback(formatError(body));

    callback(null);
  }.bind(this));
};

// upload a new firmware to the camera
Zcam.prototype.uploadFirmware = function(firmwarePath,callback){
  fs.createReadStream(firmwarePath).pipe(request.post({url:this.endpoints.uploadFirmware,json:true}, function (error, response, body) {
    if(error) return callback(error);
    if(body.code!== 0) return callback(formatError(body));

    callback(null);
  }.bind(this)).bind(this));
};

// upgrade Camera's firmware. you need to upload it first
Zcam.prototype.upgradeFirmware = function(callback){
  request.get({url:this.endpoints.upgrade + '?action=run',json:true}, function (error, response, body) {
    if(error) return callback(error);
    if(body.code!== 0) return callback(formatError(body));

    callback(null);
  }.bind(this));
};

// Shutdown the camera
Zcam.prototype.shutdown = function(callback){
  request.get({url:this.endpoints.shutdown,json:true}, function (error, response, body) {
    if(error) return callback(error);
    if(body.code!== 0) return callback(formatError(body));

    callback(null);
  }.bind(this));
};

// Reboot the camera
Zcam.prototype.reboot = function(callback){
  request.get({url:this.endpoints.reboot,json:true}, function (error, response, body) {
    if(error) return callback(error);
    if(body.code!== 0) return callback(formatError(body));

    callback(null);
  }.bind(this));
};

// set Date and Time. arg date is of type Date. will set to system time if no date specified.
Zcam.prototype.setDate = function(date, callback){
  if(typeof date === 'function'){
    callback = date;
    date = new Date();
  }
    var day = date.toISOString().substring(0, 10);
    var time = date.toISOString().substring(11, 19);

  request.get({url:this.endpoints.datetime + '?date='+ day +'&time='+ time +'',json:true}, function (error, response, body) {
    if(error) return callback(error);
    if(body.code!== 0) return callback(formatError(body));

    callback(null);
  }.bind(this));
};

// get the current camera mode
Zcam.prototype.getMode = function(callback){
  request.get({url:this.endpoints.mode + '?action=query',json:true}, function (error, response, body) {
    if(error) return callback(error);
    if(body.code!== 0) return callback(formatError(body));

    callback(null);
  }.bind(this));
};

// switch the camera to another mode. possible values for mode are playback, still or movie
Zcam.prototype.switchToMode = function(mode, callback){
  var action;
  switch (mode) {
    case 'playback':
        action = 'to_pb';
      break;
    case 'still':
        action = 'to_cap';
      break;
    case 'movie':
        action = 'to_rec';
      break;
    default:
      return calback('no mode specified');
  }

  request.get({url:this.endpoints.mode + '?action='+action,json:true}, function (error, response, body) {
    if(error) return callback(error);
    if(body.code!== 0) return callback(formatError(body));

    callback(null);
  }.bind(this));
};


function formatError(body){
  return body.code + ' : ' + body.msg + ' [' + body.desc + ']';
}

module.exports = Zcam;
