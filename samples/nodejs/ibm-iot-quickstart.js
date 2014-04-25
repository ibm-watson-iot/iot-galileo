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


var port = 1883;
var broker = '184.172.124.189';
var topic;
var client;


require('getmac').getMac(function(err, macAddress) {
  if (err) throw err;
  console.log("MAC Address: " + macAddress);
  deviceId = macAddress.replace(/:/g, '').toLowerCase();
  client = mqtt.createClient(port,broker, { "clientId": "quickstart:"+deviceId } );
  topic = "iot-1/d/" + deviceId + "/evt/galileo-quickstart/json"; 
  console.log("Topic: " + topic);
});


setInterval(sendMessage,1000);

function sendMessage() {
	var message = {};
	message.d = {};
	//read the CPU temp from sysfs
	fs.readFile('/sys/class/thermal/thermal_zone0/temp','utf8',function (err, data) {
		if (err) throw err;
		message.d.cputemp = data/1000;
		console.log(message);
		client.publish(topic,JSON.stringify(message));
	});
}

