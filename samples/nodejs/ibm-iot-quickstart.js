//*****************************************************************************
// Copyright (c) 2014 IBM Corporation and other Contributors.
//
// All rights reserved. This program and the accompanying materials
// are made available under the terms of the Eclipse Public License v1.0
// which accompanies this distribution, and is available at
// http://www.eclipse.org/legal/epl-v10.html 
//
// Contributors:
//  IBM - Initial Contribution
//*****************************************************************************

// IoT Cloud QuickStart Driver
// A sample IBM Internet of Things Cloud Quickstart Service client for Intel Galileo

var mqtt = require('mqtt');
var fs = require('fs');
var getmac = require('getmac');
var properties = require('properties');
var configFile = "./device.cfg";


var port = 1883;
var broker = "37.58.109.237";
var org = "quickstart";
var type = "galileo-quickstart";
var client;
var URI;
var topic;
var id;

properties.parse (configFile, { path: true }, function (err, config){
    getmac.getMac(function(err, macAddress) {
        if(err) throw err;

        console.log("MAC Address: " + macAddress);

        if(config){
            org = config.org || org;
            type = config.type || type
            id = config.id;
        }
        
        id = id || macAddress.replace(/:/g, '').toLowerCase();

        topic = "iot-2/evt/" + type + "/fmt/json";
        var deviceId = "d:" + org + ":" + type + ":" + id;
        
        if(config && config.token){
            URI = 'mqtt://galileo-quickstart:' + config.token + "@" + broker + ":" + port + '?clientId=' + deviceId;
        }
        
        else {
            URI = 'mqtt://' + broker + ":" + port + '?clientId=' + deviceId; 
        }

        console.log("URI: " + URI);
        client = mqtt.connect(URI);

        setInterval(sendMessage, 1000);
    });
});


function sendMessage() {
    var message = {};
    message.d = {};
    //read the CPU temp from sysfs
    fs.readFile('/sys/class/thermal/thermal_zone0/temp','utf8', function (err, data) {
        if (err) throw err;
        message.d.cputemp = data/1000;
        console.log(message);
        client.publish(topic, JSON.stringify(message));
    });
}