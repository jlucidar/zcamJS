/**
 * @module ZcamJS
 * @desc ZcamJS a node.js library for interacting with the Zcam S1 / Zcam S1 Pro cameras.
 *
 * this library provide a Zcam object you can use to :
 * - retrieve camera information
 * - get or set camera settings
 * - get or change camera operation mode
 * - download or get info from files
 * - upload the firmware and update the camera
 * - format SD Card
 * - get a live preview of the camera
 * - get a live full resolution stream from the camera (NOT IMPLEMENTED YET)
 *
 * See {@link http://github.com/imaginevision/Z-Camera-Doc|Zcam official documentation} for further information.
 *  @author jlucidar
 *  @license MIT
 *  @version 1.0.0
*/

var request = require('request');
var net = require('net');
var fs = require('fs');
var util = require('util');

/** @constant
*  @desc this is the array containing all settings parameters
*  @type {string[]}
*  @private
*/
var VALID_SETTINGS=[
  'ssid', // string type, set Wi-Fi SSID
  'ap_key', // string type, set Wi-Fi passwd
  'movfmt',
  'photosize',
  'wb', // white balance
  'iso',
  'sharpness',
  'contrast',
  'saturation',
  'brightness', // image brightness
  'meter_mode',
  'flicker',// [auto, 50Hz, 60Hz]
  'video_system', // NTSC, PAL
  'video_output', // CVBS out put
  'ev', //exposure valie
  'battery',
  'lcd', // turn on/off LCD
  'rotation', // camera stream rotation
  'mag_pos', //
  'focus', // [AF, MF]
  'iris', // aperture
  'af_mode', // [Normal, Flexible Zone]
  'af_method', // [Normal, Selection]
  'af_area', // query current af area
  'mf_drive', //
  'photo_q', // Photo quality [basic, fine, s.fine]
  'led', // control camera LED
  'beep', // control camera beep
  'max_exp', // Max exposure time
  'shutter_angle',
  'mwb', // manual white balance
  'lens_zoom', //
  'lens_focus_pos',
  'lens_focus_spd',
  'shutter_spd', // shutter speed
  'caf_range',
  'caf_sens', // continue sensitivity
  'burst_spd', // burst speed
  'lut', // [sRGB, Z-LOG]
  'last_file_name', //
  'camera_rot', //
  'multiple_mode', // [None, Master, slave]
  'dewarp', // Distortion correction
  'vignette', // Vignette correction
  'noise_reduction', // Noise reduction
  'tint',
  'file_number',
  'lcd_backlight',
  'hdmi_fmt', // HDMI output resolution
  'oled',
  'multiple_id',
  'multiple_delay',
  'shoot_mode', // Capture mode, exposure mode, P/A/S/M
  'ois_mode', // Lens OIS function
  'split_duration', //
  'multiple_to', // multiple timeout
  'liveview_audio', // liveview with audio
  'max_iso',
  'dhcp', // enable camera enable dhcpc
  'Fn', // Fn key function
  'auto_off',
  'auto_off_lcd',
  'photo_tl_num', // photo timelapse mode, max capture number
  'photo_tl_interval',
  'caf', // continue AF
  'hdmi_osd', // turn on/off HDMI OSD
  'F2', // F2 key function
  'drive_mode', // [Single, Burst shooting, Time lapse, Self-timer]
  'grid_display', // display grid in LCD
  'photo_self_interval',//in s
  'focus_area', // Af area
  'level_correction',
  'WIFI_MODE', //switch wifi mode in ap/sta]
];

/** @constant
 *  @desc this is the request buffer to get a video frame
 *  @type {Buffer}
 *  @private
*/
var STREAMING_REQUEST_BUFFER = Buffer.from([0x01]);

/**
* Create a new Zcam instance.
* @constructor
* @desc a Zcam instance refer only one camera module. you need to initialise 4 of them for a Zcam S1.
* @param {Object} [options] - the options for the Zcam instance.
* @param {string} [options.ip='10.92.32.1'] - the ip address of the Zcam camera.
* @param {string} [options.port='80'] - the port used for the control interface
* @param {string} [options.previewStreamingPort='9876'] - the port used for preview streaming
* @param {string} [options.DCIMFolder='100MEDIA'] - the DCIM folder used by the camera.

* @example var zcam1 = new Zcam({ip:'10.92.32.1'});
*/
function Zcam(options){
  options = options || {};

  this.ip = options.ip || '10.98.32.1';
  this.port = options.port || '80';
  this.previewStreamingPort = options.previewStreamingPort || 9876;
  this.DCIMFolder = options.DCIMFolder || '100MEDIA';

  var root =  'http://' + this.ip + ':' + this.port;
  this.endpoints = {
    root:root,
    info : root + '/info',
    temperature : root + '/ctrl/temperature',
    timelapsePictureCount : root + '/ctrl/timelapse_stat',
    session : root + '/ctrl/session',
    uploadFirmware : root + '/uploadfirmware',
    upgrade : root + '/ctrl/upgrade',
    shutdown : root + '/ctrl/shutdown',
    reboot : root + '/ctrl/reboot',
    datetime : root + '/datetime',
    mode : root + '/ctrl/mode',
    listDCIMFolders : root + '/DCIM',
    filesManager : root + '/DCIM/'+ this.DCIMFolder + '',
    still : root + '/ctrl/still',
    movie : root + '/ctrl/rec',
    setting : root + '/ctrl',
    af : root + '/ctrl/af',
    magnify : root + '/ctrl/mag',
    sdcard : root + '/ctrl/card'
  };

}

/** @function getInfo
 *  @desc get General Information about the camera (model, hardware and software version, serial number, bluetooth mac address, etc...)
    @param {getInfoCallback} callback
*/

/**
 *  @callback getInfoCallback
 *  @param {string} error - contains the error message (null if none)
 *  @param {Object} info - info Object
 *  @param {string} info.model - model of the camera
 *  @param {string} info.sw - software version
 *  @param {string} info.hw - hardware version
 *  @example zcam1.getInfo(function(err,info){
      //use camera info here
    });
*/
Zcam.prototype.getInfo = function(callback){
  request.get({url:this.endpoints.info, json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    this.info = body;
    callback(null,this);
  }.bind(this));
};


/** @function getTemperature
 *  @desc return the temperature in degree Celsius
    @param {getTemperatureCallback} callback
*/
/**
 *  @callback getTemperatureCallback
 *  @param {string} error - contains the error message (null if none)
 *  @param {number} temperature - temperature in degree Celsius
 *  @example zcam1.getTemperature(function(err,temperature){
      //use temperature here
    });
*/
Zcam.prototype.getTemperature = function(callback){
  request.get({url:this.endpoints.temperature, json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    temperature = body.msg;

    callback(null,parseInt(temperature));
  }.bind(this));
};

/** @function getTimelapsePictureCount
 *  @desc get the number of pictures taken during a timelapse Session
    @param {getTimelapsePictureCountCallback} callback
*/
/**
 *  @callback getTimelapsePictureCountCallback
 *  @param {string} error - contains the error message (null if none)
 *  @param {number} timelapsePictureCount - number of pictures taken during the timelapse
 *  @example zcam1.getTimelapsePictureCount(function(err,timelapsePictureCount){
      //use timelapsePictureCount here
    });
*/
Zcam.prototype.getTimelapsePictureCount = function(callback){
  request.get({url:this.endpoints.timelapsePictureCount, json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    timelapsePictureCount = body.msg;

    callback(null,parseInt(timelapsePictureCount));
  }.bind(this));
};

/** @function startSession
 *  @desc lock a session (don't allow other people to control the cam) or do a heartbeat
    @param {startSessionCallback} callback
*/
/** @callback startSessionCallback
 *  @param {string} error - contains the error message (null if none)
 *  @example zcam1.startSession(function(err){
      //session started
    });
*/
Zcam.prototype.startSession = function(callback){
  request.get({url:this.endpoints.session, json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    callback(null);
  }.bind(this));
};


/** @function stopSession
 *  @desc unlock the session (allow other people to control the cam)
    @param {stopSessionCallback} callback
*/
/** @callback stopSessionCallback
 *  @param {string} error - contains the error message (null if none)
 *  @example zcam1.stopSession(function(err){
      //session stopped
    });
*/
Zcam.prototype.stopSession = function(callback){
  request.get({url:this.endpoints.session + '?action=quit', json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    callback(null);
  }.bind(this));
};

/** @function uploadFirmware
 *  @desc upload a new firmware to the camera
    @param {string} firmwarePath the path to the new camera firmware
    @param {uploadFirmwareCallback} callback
*/
/** @callback uploadFirmwareCallback
 *  @param {string} error - contains the error message (null if none)
 *  @example zcam1.uploadFirmware(firmwarePath,function(err){
      //firmware uploaded
    });
*/
Zcam.prototype.uploadFirmware = function(firmwarePath,callback){
  fs.createReadStream(firmwarePath).pipe(request.post({url:this.endpoints.uploadFirmware, json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    callback(null);
  }.bind(this)).bind(this));
};

/** @function upgradeFirmware
 *  @desc upgrade Camera's firmware. you need to upload it first
    @param {upgradeFirmwareCallback} callback
*/
/** @callback upgradeFirmwareCallback
 *  @param {string} error - contains the error message (null if none)
 *  @example zcam1.upgradeFirmware(function(err){
      //firmware upgraded
    });
*/
Zcam.prototype.upgradeFirmware = function(callback){
  request.get({url:this.endpoints.upgrade + '?action=run', json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    callback(null);
  }.bind(this));
};

/** @function shutdown
 *  @desc Shutdown the camera
    @param {shutdownCallback} callback
*/
/** @callback shutdownCallback
 *  @param {string} error - contains the error message (null if none)
 *  @example zcam1.shutdown(function(err){
      //camera is shutting down
    });
*/
Zcam.prototype.shutdown = function(callback){
  request.get({url:this.endpoints.shutdown, json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    callback(null);
  }.bind(this));
};

/** @function reboot
 *  @desc Reboot the camera
    @param {rebootCallback} callback
*/
/** @callback rebootCallback
 *  @param {string} error - contains the error message (null if none)
 *  @example zcam1.reboot(function(err){
      //camera is rebooting
    });
*/
Zcam.prototype.reboot = function(callback){
  request.get({url:this.endpoints.reboot, json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    callback(null);
  }.bind(this));
};

/** @function setDate
 *  @desc  set camera's Date and Time. will set to system time if no date specified.
    @param {Date}[date=Date.now()] the date used to set up camera's date.
    @param {setDateCallback} callback
*/
/** @callback setDateCallback
 *  @param {string} error - contains the error message (null if none)
 *  @example zcam1.setDate(date,function(err){
      //date is set
    });
*/
Zcam.prototype.setDate = function(date, callback){
  if (typeof date === 'function'){
    callback = date;
    date = new Date();
  }
  var day = date.toISOString().substring(0, 10);
  var time = date.toISOString().substring(11, 19);

  request.get({url:this.endpoints.datetime + '?date='+ day +'&time='+ time +'', json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    callback(null);
  }.bind(this));
};

/** @function getMode
 *  @desc get the current camera mode
    @param {getModeCallback} callback
*/
/**
 *  @callback getModeCallback
 *  @param {string} error - contains the error message (null if none)
 *  @param {string} mode - the current camera mode ('pb' | 'pb_ing' | 'pb_paused' | 'cap' | 'cap_tl_ing' | 'cap_tl_idle' | 'cap_idle' | 'cap_burst' | 'rec' | 'rec_ing' | 'unknown')
 *  @example zcam1.getMode(function(err,mode){
      //use mode here
    });
*/
Zcam.prototype.getMode = function(callback){
  request.get({url:this.endpoints.mode + '?action=query', json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }
    var mode = body.msg;

    callback(null,mode);
  }.bind(this));
};

/** @function switchToMode
 *  @desc  switch the camera to another mode. possible values for mode are playback, still or movie
    @param {string} mode the mode to switch to. ('playback' | 'still' | 'movie')
    @param {switchToModeCallback} callback
*/
/** @callback switchToModeCallback
 *  @param {string} error - contains the error message (null if none)
 *  @example zcam1.switchToMode(function(err){
      //new mode is set
    });
*/
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

  request.get({url:this.endpoints.mode + '?action='+action, json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    callback(null);
  }.bind(this));
};

/** @function listDCIMFolders
 *  @desc list the folders in the DCIM directory
    @param {listDCIMFoldersCallback} callback
*/
/**
 *  @callback listDCIMFoldersCallback
 *  @param {string} error - contains the error message (null if none)
 *  @param {string[]} folders - the list of folders
 *  @example zcam1.listDCIMFolders(function(err,folders){
      //use folders here
    });
*/
Zcam.prototype.listDCIMFolders = function(callback){
  request.get({url:this.endpoints.listDCIMFolders, json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    var folders = body.files;
    callback(null,folders);
  }.bind(this));
};

/** @function setDCIMFolder
 *  @desc  set the fileManager to work in an other DCIM directory
    @param {string} DCIMFolder the DCIM folder to switch to .
    @param {setDCIMFolderCallback} callback
*/
/** @callback setDCIMFolderCallback
 *  @param {string} error - contains the error message (null if none)
 *  @example zcam1.setDCIMFolder(function(err){
      //new DCIM folder is set.
    });
*/
Zcam.prototype.setDCIMFolder = function(DCIMFolder,callback){
  this.DCIMFolder = DCIMFolder;
  callback(null);
};

/** @function listFiles
 *  @desc list files in the working directory
    @param {listFilesCallback} callback
*/
/**
 *  @callback listFilesCallback
 *  @param {string} error - contains the error message (null if none)
 *  @param {string[]} files - the list of files in the working directory
 *  @example zcam1.listFiles(function(err,folders){
      //use files here
    });
*/
Zcam.prototype.listFiles = function(callback){
  request.get({url:this.endpoints.filesManager + '?p=1&v=1', json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    var files = body.files;
    callback(null,files);
  }.bind(this));
};

// download file by its filename in specified path (or current path if not specified)
Zcam.prototype.downloadFile = function(filename, path, callback){
  if (typeof filename==='function'){
    callback = filename;
    return callback('you must specify a filename');
  }
  if (typeof path==='function'){
    callback = path;
    path = process.cwd();
  }

  request.get({url:this.endpoints.filesManager + filename})
  .on('error', function(err) {
    return callback(error);
  })
  .on('finish',function(){
    return callback(null);
  })
  .pipe(fs.createWriteStream(path+filename));

};

// return the stream of the specified file by its filename
Zcam.prototype.getFileStream = function(filename, callback){
  if (typeof filename==='function'){
    callback = filename;
    return callback('you must specify a filename');
  }

  callback(null,request.get({url:this.endpoints.filesManager + filename}));

};

// delete a file in the working DCIM directory by its filename
Zcam.prototype.deleteFile = function(filename,callback){
  if (typeof filename==='function'){
    callback = filename;
    return callback('you must specify a filename');
  }
  request.get({url:this.endpoints.filesManager + filename + '?act=rm', json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    callback(null);
  }.bind(this));
};

// get file info in the working DCIM directory by its filename
Zcam.prototype.getFileInfo = function(filename,callback){
  if (typeof filename==='function'){
    callback = filename;
    return callback('you must specify a filename');
  }
  request.get({url:this.endpoints.filesManager + filename + '?act=info', json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    var info=body.msg;

    callback(null,info);
  }.bind(this));
};


// download thumbnail of file by its filename in specified path (or current path if not specified)
Zcam.prototype.downloadFileThumbnail = function(filename, path, callback){
  if (typeof filename==='function'){
    callback = filename;
    return callback('you must specify a filename');
  }
  if (typeof path==='function'){
    callback = path;
    path = process.cwd();
  }

  request.get({url:this.endpoints.filesManager + filename + '?act=thm'})
  .on('error', function(err) {
    return callback(error);
  })
  .on('finish',function(){
    return callback(null);
  })
  .pipe(fs.createWriteStream(path+filename));

};

// return the stream of the thumbnail for the specified file by its filename
Zcam.prototype.getFileThumbnailStream = function(filename, callback){
  if (typeof filename==='function'){
    callback = filename;
    return callback('you must specify a filename');
  }

  callback(null,request.get({url:this.endpoints.filesManager + filename + '? act=thm'}));

};

// download screennail of file by its filename in specified path (or current path if not specified)
Zcam.prototype.downloadFileScreennail = function(filename, path, callback){
  if (typeof filename==='function'){
    callback = filename;
    return callback('you must specify a filename');
  }
  if (typeof path==='function'){
    callback = path;
    path = process.cwd();
  }

  request.get({url:this.endpoints.filesManager + filename + '?act=scr'})
  .on('error', function(err) {
    return callback(error);
  })
  .on('finish',function(){
    return callback(null);
  })
  .pipe(fs.createWriteStream(path+filename));

};

// return the stream of the screennail for the specified file by its filename
Zcam.prototype.getFileScreennailStream = function(filename, callback){
  if (typeof filename==='function'){
    callback = filename;
    return callback('you must specify a filename');
  }

  callback(null,request.get({url:this.endpoints.filesManager + filename + '? act=scr'}));

};

// get file creation date in the working DCIM directory by its filename
Zcam.prototype.getFileCreationDate = function(filename,callback){
  if (typeof filename==='function'){
    callback = filename;
    return callback('you must specify a filename');
  }
  request.get({url:this.endpoints.filesManager + filename + '?act=ct', json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    var date=new Date(body.msg*1000);

    callback(null,date);
  }.bind(this));
};

// get file's MD5 date in the working DCIM directory by its filename
Zcam.prototype.getFileMD5= function(filename,callback){
  if (typeof filename==='function'){
    callback = filename;
    return callback('you must specify a filename');
  }
  request.get({url:this.endpoints.filesManager + filename + '?act=md5', json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    var md5=body.msg;

    callback(null,md5);
  }.bind(this));
};

// take a picture and send the filename back
Zcam.prototype.takePicture = function(callback){
  request.get({url:this.endpoints.stillCapture + '?action=cap', json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    var file=body.msg;

    callback(null,file);
  }.bind(this));
};

// force to single capture (picture mode maybe ?)
Zcam.prototype.forceToPictureMode = function(callback){
  request.get({url:this.endpoints.stillCapture + '?action=single', json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    callback(null);
  }.bind(this));
};

// query the number of remaining capture (picture count left maybe?)
Zcam.prototype.getPictureCountLeft = function(callback){
  request.get({url:this.endpoints.stillCapture + '?action=remain', json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    var pictureCountLeft=body.msg;

    callback(null,pictureCountLeft);
  }.bind(this));
};

// cancel burst mode
Zcam.prototype.cancelBurstMode = function(callback){
  request.get({url:this.endpoints.stillCapture + '?action=cancel_burst', json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    callback(null);
  }.bind(this));
};

// start Recording and return the filename
Zcam.prototype.startRecording = function(callback){
  request.get({url:this.endpoints.movie + '?action=start', json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    var file=body.msg;

    callback(null,file);
  }.bind(this));
};

// stop Recording and return the filename
Zcam.prototype.stopRecording = function(callback){
  request.get({url:this.endpoints.movie + '?action=stop', json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    var file=body.msg;

    callback(null,file);
  }.bind(this));
};

// get the remaining time of recording.
Zcam.prototype.getRemainingRecordingTime = function(callback){
  request.get({url:this.endpoints.movie + '?action=remain', json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    var time=body.msg;

    callback(null,time);
  }.bind(this));
};

// retrieve a setting by it's key name (view VALID_SETTINGS for more info)
Zcam.prototype.getSetting = function(settingName, callback){
  if (typeof settingName==='function'){
    callback = settingName;
    return callback('you must specify a filename');
  }
  request.get({url:this.endpoints.setting + '/get?k='+settingName, json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    var setting=body.value;

    callback(null,setting);
  }.bind(this));
};

// get an object containing all settings and their values
Zcam.prototype.getAllSettings = function(callback){
  var getSettingPromises = [];
  for (i in Zcam.VALID_SETTINGS){
    getSettingPromisified = util.promisify(this.getSetting);
    getSettingPromise = getSettingPromisified.bind(this,Zcam.VALID_SETTINGS[i])();
    getSettingPromises.push(getSettingPromise);
  }

  function reflect(promise){
    return promise.then(function(v){
      return v;
    },
    function(e){
      return e;
    });
  }

  Promise.all(getSettingPromises.map(reflect)).then(function(values){
    var settings = {};
    for (var i in values){
      settings[VALID_SETTINGS[i]]=values[i];
    }
    callback(null,settings);
  }).catch(function(err){
    VALID_SETTINGS[i];
    callback(err);
  });
};

// retrieve a setting information by it's key name (view VALID_SETTINGS for more info)
Zcam.prototype.getSettingInfo = function(settingName, callback){
  if (typeof settingName==='function'){
    callback = settingName;
    return callback('you must specify a filename');
  }
  request.get({url:this.endpoints.setting + '/get?k='+settingName, json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    var type,options,min,max,step;
    switch (body.type) {
      case 0:
      type = 'range';
      min = body.min;
      max = body.max;
      step = body.step;
      break;
      case 1:
      type = 'options';
      options = body.opts;
      break;
      case 2:
      type = 'string';
      break;
      default:
    }

    var settingInfo={
      description :body.desc,
      type :type,
      readonly:(body.ro?true:false),
      options :options,
      min : min,
      max : max,
      step : step,
    };

    callback(null,settingInfo);
  }.bind(this));
};


// get an object containing all settings info
Zcam.prototype.dumpSettings = function(callback){
  var getSettingInfoPromises = [];
  for (i in Zcam.VALID_SETTINGS){
    getSettingInfoPromisified = util.promisify(this.getSettingInfo);
    getSettingInfoPromise = getSettingInfoPromisified.bind(this)();
    getSettingInfoPromises.push(getSettingInfoPromise);
  }

  Promise.all(getSettingInfoPromises).then(function(settingsInfo){
    callback(null, settingsInfo);
  }).catch(function(err){
    callback(err);
  });
};

// set a setting by it's key name (view VALID_SETTINGS for more info)
Zcam.prototype.setSetting = function(settingName, value, callback){
  if (typeof settingName==='function'){
    callback = settingName;
    return callback('you must specify a setting name');
  }
  if (typeof value==='function'){
    callback = settingName;
    return callback('you must specify a value for the setting');
  }
  request.get({url:this.endpoints.setting + '/set?'+settingName+'='+value, json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    callback(null);
  }.bind(this));
};

// restore all settings
Zcam.prototype.clearSettings = function(settingName,callback){
  if (typeof settingName==='function'){
    callback = settingName;
    return callback('you must specify a setting name');
  }
  request.get({url:this.endpoints.setting + '/set?action=clear', json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    callback(null);
  }.bind(this));
};

// set AutoFocus zone determined by a rectangle of max 16bits of with
Zcam.prototype.setAutofocusZone = function(xstart,ystart,xstop,ystop,callback){
  if (typeof xstart==='function' || typeof ystart==='function' || typeof xstop==='function' || typeof ystop==='function'){
    callback = settingName;
    return callback('you must specify 2 set of coordinates (xstart,ystart,xstop,ystop)');
  }
  if (xstart < 0 || xstart >16 || xstop < 0 || xstop >16 || ystart < 0 || ystart >16 || ystop < 0 || ystop >16 ){
    return callback('wrong dimensions');
  }
  if (xstart>=xstop){
    return callback('xstart is higher than xstop');
  }
  if (ystart>=ystop){
    return callback('ystart is higher than ystop');
  }

  var x = ( Math.pow(2,xstop - xstart + 1 ) - 1 ) << xstart;
  var y = ( Math.pow(2,ystop - ystart + 1 ) - 1 ) << ystart;
  var index = x<<16 | y;

  request.get({url:this.endpoints.af + '?pos='+index, json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    callback(null);
  }.bind(this));
};

// enable Magnify
Zcam.prototype.enableMagnify = function(settingName,callback){
  if (typeof settingName==='function'){
    callback = settingName;
    return callback('you must specify a setting name');
  }
  request.get({url:this.endpoints.magnify + '?action=enable', json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    callback(null);
  }.bind(this));
};

// disable Magnify
Zcam.prototype.disableMagnify = function(settingName,callback){
  if (typeof settingName==='function'){
    callback = settingName;
    return callback('you must specify a setting name');
  }
  request.get({url:this.endpoints.magnify + '?action=disable', json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    callback(null);
  }.bind(this));
};


// set Magnify zone determined by a percentage in x and y
Zcam.prototype.setMagnifyZone = function(xpercent,ypercent,callback){
  if (typeof xpercent==='function' || typeof ypercent==='function'){
    callback = ypercent | xpercent;
    return callback('you must specify a percentage in x and y.');
  }

  if (xpercent < 0 || xpercent >1000 || ypercent < 0 || ypercent >1000 ){
    return callback('wrong dimensions');
  }

  var index = xpercent<<16 | ypercent;

  request.get({url:this.endpoints.magnify + '?pos='+index, json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    callback(null);
  }.bind(this));
};

// forrmat card to default format (FAT32)
Zcam.prototype.formatSDCard = function(callback){
  request.get({url:this.endpoints.sdcard + '?action=format', json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    callback(null);
  }.bind(this));
};

// check if SD card is present
Zcam.prototype.checkSDCardPresence = function(callback){
  request.get({url:this.endpoints.sdcard + '?action=present', json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    callback(null,body.msg);
  }.bind(this));
};

// forrmat card to FAT32
Zcam.prototype.formatSDCardToFAT32 = function(callback){
  request.get({url:this.endpoints.sdcard + '?action=fat32', json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    callback(null);
  }.bind(this));
};

// forrmat card to exFAT
Zcam.prototype.formatSDCardToexFAT = function(callback){
  request.get({url:this.endpoints.sdcard + '?action=exfat', json:true}, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (body.code!== 0) {
      return callback(formatError(body));
    }

    callback(null);
  }.bind(this));
};


//PREVIEW STREAMING INTERFACE


Zcam.prototype.initPreviewStreaming = function(listener, callback){
  if (this.socket){
    return callback('socket already opened !');
  }

  this.socket = new net.Socket();
  this.socket.connect(this.previewStreamingPort,this.ip,callback);
  var nextFrameLength=-1;
  var buf  = Buffer.alloc(0);

  this.socket.on('data',function(data){
    if (data.length === 4){
      //console.log(data, data.readUInt32BE(0));
      nextFrameLength = -1;
      listener(buf);
      nextFrameLength = data.readUInt32BE(0);
      buf = Buffer.alloc(0);
      //this.requestPreviewFrame();
    } else if (nextFrameLength!==-1){
      buf = Buffer.concat([buf,data],buf.length+data.length);
      if ( buf.length === nextFrameLength){
        //console.log('received frame : '+ buf.length);
      } else {
        this.requestPreviewFrame();
      }
    } else {
      console.log('weird stuff : ');
      console.log(buf, data);
      this.requestPreviewFrame();
    }

  }.bind(this));
  this.socket.on('close',function(){
    this.socket=undefined;
  });
};

Zcam.prototype.requestPreviewFrame = function(callback){
  if (!this.socket){
    return callback('init callback first !');
  }
  this.socket.write(STREAMING_REQUEST_BUFFER);
};

function formatError(body){
  return body.code + ' : ' + body.msg + ' [' + body.desc + ']';
}

Zcam.VALID_SETTINGS = VALID_SETTINGS;
module.exports = Zcam;
