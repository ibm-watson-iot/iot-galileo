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
var configFile = "./device.sample.cfg";


var port = 1883;
var broker = "messaging.quickstart.internetofthings.ibmcloud.com";
var topic;
var client;

require('getmac').getMac(function(err, macAddress) {
    if (err) throw err;
    require('properties').parse(configFile, { path: true }, function (err, config){
        var options = {};
        
        // Set the configuration used when no device.cfg is present
        var organization = "quickstart";
        var deviceType = "galileo-quickstart";

        // If device.cfg was loaded successfully update the configuarion
        if(config){
            organization = config.org || organization;
            deviceType = config.type || deviceType;
            macAddress = config.id || macAddress;

            broker = organization + ".messaging.internetofthings.ibmcloud.com";

            if(config.token){
                options.username = organization;
                options.password = config.token;
            }
        }
        
        deviceId = macAddress.toString().replace(/:/g, '').toLowerCase();
        options.clientId = "d:" + organization + ":" + deviceType + ":" + deviceId;
        client = mqtt.createClient(port, broker, options);
        topic = "iot-2/evt/" + deviceType + "/fmt/json"; 
          
        
        console.log("Broker: " + broker);
        console.log("MAC Address: " + macAddress);
        console.log("Topic: " + topic);
        console.log("Connection options: ")
        console.log(options);
    });
});

setInterval(sendMessage,1000);

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