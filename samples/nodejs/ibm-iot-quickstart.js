var mqtt = require('mqtt');
var fs = require('fs');


var port = 1883;
var broker = '184.172.124.189';
var topic;
var client;


require('getmac').getMac(function(err, macAddress) {
  if (err) throw err;
  deviceId = macAddress.replace(/:/g, '');
  console.log("MAC Address: " + macAddress);
  client = mqtt.createClient(port,broker, { "clientId": "quickstart:"+deviceId } );
  topic = "iot-1/d/" + deviceId + "/evt/galileo-quickstart/json"; 
  console.log("Topic: " + topic);
});


setInterval(sendMessage,1000);

function sendMessage() {
	var message = {};
	message.d = {};
	//message.d.date = Date.now();
	//read the CPU temp from sysfs
	fs.readFile('/sys/class/thermal/thermal_zone0/temp','utf8',function (err, data) {
		if (err) throw err;
		message.d.cputemp = data/1000;
		console.log(message);
		client.publish(topic,JSON.stringify(message));
	});
	

}

