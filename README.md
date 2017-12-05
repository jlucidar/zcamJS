<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

## ZcamJS (Documentation in progress)

ZcamJS a node.js library for interacting with the Zcam S1 / Zcam S1 Pro cameras.

this library provide a Zcam object you can use to :

-   retrieve camera information
-   get or set camera settings
-   get or change camera operation mode
-   download or get info from files
-   upload the firmware and update the camera
-   format SD Card
-   get a live preview of the camera
-   get a live full resolution stream from the camera (NOT IMPLEMENTED YET)

See [Zcam official documentation](http://github.com/imaginevision/Z-Camera-Doc) for further information.

-   **version**: 1.0.0
-   **author**: jlucidar
-   **license**: MIT

### Table of Contents

-   [Zcam](#zcam)
-   [getInfo](#getinfo)
-   [getTemperature](#gettemperature)
-   [getTimelapsePictureCount](#gettimelapsepicturecount)
-   [startSession](#startsession)
-   [stopSession](#stopsession)
-   [uploadFirmware](#uploadfirmware)
-   [upgradeFirmware](#upgradefirmware)
-   [shutdown](#shutdown)
-   [reboot](#reboot)
-   [setDate](#setdate)
-   [getMode](#getmode)
-   [switchToMode](#switchtomode)
-   [listDCIMFolders](#listdcimfolders)
-   [setDCIMFolder](#setdcimfolder)
-   [listFiles](#listfiles)


## Zcam

a Zcam instance refer only one camera module. you need to initialise 4 of them for a Zcam S1.

**Parameters**

-   `options` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** the options for the Zcam instance.
    -   `options.ip` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the ip address of the Zcam camera. (optional, default `'10.92.32.1'`)
    -   `options.port` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the port used for the control interface (optional, default `'80'`)
    -   `options.previewStreamingPort` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the port used for preview streaming (optional, default `'9876'`)
    -   `options.DCIMFolder` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the DCIM folder used by the camera. (optional, default `'100MEDIA'`)

**Examples**

```javascript
var zcam1 = new Zcam({ip:'10.92.32.1'});
```

## getInfo

get General Information about the camera (model, hardware and software version, serial number, bluetooth mac address, etc...)

**Parameters**

-   `callback` **[getInfoCallback](#getinfocallback)**

#### getInfoCallback

Type: [Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)

**Parameters**

-   `error` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** contains the error message (null if none)
-   `info` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** info Object
    -   `info.model` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** model of the camera
    -   `info.sw` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** software version
    -   `info.hw` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** hardware version

**Examples**

```javascript
zcam1.getInfo(function(err,info){
//use camera info here
});
```

## getTemperature

return the temperature in degree Celsius

**Parameters**

-   `callback` **[getTemperatureCallback](#gettemperaturecallback)**

#### getTemperatureCallback

Type: [Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)

**Parameters**

-   `error` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** contains the error message (null if none)
-   `temperature` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** temperature in degree Celsius

**Examples**

```javascript
zcam1.getTemperature(function(err,temperature){
//use temperature here
});
```

## getTimelapsePictureCount

get the number of pictures taken during a timelapse Session

**Parameters**

-   `callback` **[getTimelapsePictureCountCallback](#gettimelapsepicturecountcallback)**

#### getTimelapsePictureCountCallback

Type: [Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)

**Parameters**

-   `error` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** contains the error message (null if none)
-   `timelapsePictureCount` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** number of pictures taken during the timelapse

**Examples**

```javascript
zcam1.getTimelapsePictureCount(function(err,timelapsePictureCount){
//use timelapsePictureCount here
});
```

## startSession

lock a session (don't allow other people to control the cam) or do a heartbeat

**Parameters**

-   `callback` **[startSessionCallback](#startsessioncallback)**

#### startSessionCallback

Type: [Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)

**Parameters**

-   `error` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** contains the error message (null if none)

**Examples**

```javascript
zcam1.startSession(function(err){
//session started
});
```

## stopSession

unlock the session (allow other people to control the cam)

**Parameters**

-   `callback` **[stopSessionCallback](#stopsessioncallback)**

#### stopSessionCallback

Type: [Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)

**Parameters**

-   `error` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** contains the error message (null if none)

**Examples**

```javascript
zcam1.stopSession(function(err){
//session stopped
});
```

## uploadFirmware

upload a new firmware to the camera

**Parameters**

-   `firmwarePath` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the path to the new camera firmware
-   `callback` **[uploadFirmwareCallback](#uploadfirmwarecallback)**

#### uploadFirmwareCallback

Type: [Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)

**Parameters**

-   `error` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** contains the error message (null if none)

**Examples**

```javascript
zcam1.uploadFirmware(firmwarePath,function(err){
//firmware uploaded
});
```

## upgradeFirmware

upgrade Camera's firmware. you need to upload it first

**Parameters**

-   `callback` **[upgradeFirmwareCallback](#upgradefirmwarecallback)**

#### upgradeFirmwareCallback

Type: [Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)

**Parameters**

-   `error` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** contains the error message (null if none)

**Examples**

```javascript
zcam1.upgradeFirmware(function(err){
//firmware upgraded
});
```

## shutdown

Shutdown the camera

**Parameters**

-   `callback` **[shutdownCallback](#shutdowncallback)**

#### shutdownCallback

Type: [Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)

**Parameters**

-   `error` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** contains the error message (null if none)

**Examples**

```javascript
zcam1.shutdown(function(err){
//camera is shutting down
});
```

## reboot

Reboot the camera

**Parameters**

-   `callback` **[rebootCallback](#rebootcallback)**

#### rebootCallback

Type: [Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)

**Parameters**

-   `error` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** contains the error message (null if none)

**Examples**

```javascript
zcam1.reboot(function(err){
//camera is rebooting
});
```

## setDate

set camera's Date and Time. will set to system time if no date specified.

**Parameters**

-   `date` **[Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)** the date used to set up camera's date. (optional, default `Date.now()`)
-   `callback` **[setDateCallback](#setdatecallback)**

#### setDateCallback

Type: [Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)

**Parameters**

-   `error` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** contains the error message (null if none)

**Examples**

```javascript
zcam1.setDate(date,function(err){
//date is set
});
```

## getMode

get the current camera mode

**Parameters**

-   `callback` **[getModeCallback](#getmodecallback)**

#### getModeCallback

Type: [Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)

**Parameters**

-   `error` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** contains the error message (null if none)
-   `mode` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the current camera mode ('pb' | 'pb_ing' | 'pb_paused' | 'cap' | 'cap_tl_ing' | 'cap_tl_idle' | 'cap_idle' | 'cap_burst' | 'rec' | 'rec_ing' | 'unknown')

**Examples**

```javascript
zcam1.getMode(function(err,mode){
//use mode here
});
```

## switchToMode

switch the camera to another mode. possible values for mode are playback, still or movie

**Parameters**

-   `mode` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the mode to switch to. ('playback' | 'still' | 'movie')
-   `callback` **[switchToModeCallback](#switchtomodecallback)**

#### switchToModeCallback

Type: [Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)

**Parameters**

-   `error` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** contains the error message (null if none)

**Examples**

```javascript
zcam1.switchToMode(function(err){
//new mode is set
});
```

## listDCIMFolders

list the folders in the DCIM directory

**Parameters**

-   `callback` **[listDCIMFoldersCallback](#listdcimfolderscallback)**

#### listDCIMFoldersCallback

Type: [Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)

**Parameters**

-   `error` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** contains the error message (null if none)
-   `folders` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>** the list of folders

**Examples**

```javascript
zcam1.listDCIMFolders(function(err,folders){
//use folders here
});
```

## setDCIMFolder

set the fileManager to work in an other DCIM directory

**Parameters**

-   `DCIMFolder` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the DCIM folder to switch to .
-   `callback` **[setDCIMFolderCallback](#setdcimfoldercallback)**

#### setDCIMFolderCallback

Type: [Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)

**Parameters**

-   `error` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** contains the error message (null if none)

**Examples**

```javascript
zcam1.setDCIMFolder(function(err){
//new DCIM folder is set.
});
```

## listFiles

list files in the working directory

**Parameters**

-   `callback` **[listFilesCallback](#listfilescallback)**

#### listFilesCallback

Type: [Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)

**Parameters**

-   `error` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** contains the error message (null if none)
-   `files` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>** the list of files in the working directory

**Examples**

```javascript
zcam1.listFiles(function(err,folders){
//use files here
});
```
