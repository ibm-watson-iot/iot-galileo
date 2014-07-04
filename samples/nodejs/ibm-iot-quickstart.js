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
var configFile = "./device.cfg";


var port = 1883;
var broker = "quickstart.messaging.internetofthings.ibmcloud.com";
var topic;
var client;

require('getmac').getMac(function(err, macAddress) {
    if (err) throw err;
    
    macAddress = macAddress.toString().replace(/:/g, '').toLowerCase();

    require('properties').parse(configFile, { path: true }, function (err, config){
        var options = {};
        
        // Set the configuration used when no device.cfg is present
        var organization = "quickstart";
        var deviceType = "iotsample-galileo";

        // If device.cfg was loaded successfully update the configuarion
        if(config){

            if(config['auth-method']){
                if(config['auth-method'] !== "token"){
                    throw "Authentication method not supported. Please make sure you use \"token\".";
                }
                if(config['auth-method'] && !config['auth-token']){
                    throw "Authentication method set to \"token\" but no \"auth-token\" setting was provided in device.cfg";
                }

                options.username = "use-token-auth"; // Actual value of options.username can be set to any string
                options.password = config['auth-token'];
            }

            if(!config.org){
                throw "Configuration should include an org field that specifies your organization.";
            }

            if(!config.type){
                throw "Configuration should include a type field that specifies your device type.";
            }

            if(!config.id){
                throw "Configuration should include an id field that specifies your device id.";
            }

            console.log("Configuration loaded successfully, connecting your device to the registered service.");

            organization = config.org;
            deviceType = config.type;
            macAddress = config.id;

            broker = organization + ".messaging.internetofthings.ibmcloud.com";
        }
        else {
            console.log("No configuration file found, connecting to the quickstart servcice.");
        }
        
        options.clientId = "d:" + organization + ":" + deviceType + ":" + macAddress;
        client = mqtt.createClient(port, broker, options);
        topic = "iot-2/evt/status/fmt/json";

        var interval = setInterval(sendMessage,1000);

        if(config){
            client.subscribe('/iot-2/cmd/+/fmt/json');

            client.on('message', function(topic, message) {
                console.log('Received command on topic: ' + topic);
                
                var msg;
                try {
                    msg = JSON.parse(message);
                }
                catch (e) {
                    msg = {};
                    console.log("Couldn't parse recieved command. Please ensure it is valid JSON.");
                }

                if(msg.hasOwnProperty('send-status')){
                    if(msg['send-status']){
                        if(!interval){
                            interval = setInterval(sendMessage,1000);
                        }
                    }
                    else {
                        clearInterval(interval);
                        interval = false;
                    }
                }
            });
        }
          
        
        console.log("Broker: " + broker);
        console.log("Device ID: " + macAddress);
        console.log("Topic: " + topic);
        console.log("Connection options: ");
        console.log(options);
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
