#include <Arduino.h>
#include <Countdown.h>
#include <EthernetStack.h>
#include <FP.h>
#include <MQTTClient.h>
#include <MQTTConnect.h>
#include <MQTTLogging.h>
#include <MQTTPacket.h>
#include <MQTTPublish.h>
#include <MQTTSubscribe.h>
#include <MQTTUnsubscribe.h>
#include <StackTrace.h>
#include <WiFi.h>
#include <WifiIPStack.h>

#include <SPI.h>
#include <Ethernet.h>
#include <EthernetStack.h>
#include <Countdown.h>
#include <MQTTClient.h>


//MODIFY the following two properties to the mac address 
//of your Intel Galileo. It can be found on the sticker on the device.
//E.g : If its printed 984FEE00905D, you will need to modify it as below
byte mac[] = { 0x98, 0x4F, 0xEE, 0x00, 0x90, 0x5D };
char deviceId[] = "984fee00905d"; //value must be in lowercase


char quickstartEndpoint[] = "quickstart.messaging.internetofthings.ibmcloud.com";
int mqttPort = 1883;

char clientId[50];
char topic[] = "iot-2/evt/status/fmt/json";

#define MQTT_MAX_PACKET_SIZE 100

EthernetStack ipstack;  
MQTT::Client<EthernetStack, Countdown, MQTT_MAX_PACKET_SIZE> client(ipstack);

void setup() {
  system("/etc/init.d/networking restart");
  Serial.begin(9600);
  Ethernet.begin(mac);
  sprintf(clientId, "d:quickstart:iotsample-galileo:%s", deviceId);
  delay(2000);
}

void loop() {
  int rc = -1;

  if (!client.isConnected()) {
    Serial.print("Connecting to Quickstart with clientid : ");
    Serial.println(clientId);
    while (rc != 0) {
      rc = ipstack.connect(quickstartEndpoint, mqttPort);
    }
    MQTTPacket_connectData data = MQTTPacket_connectData_initializer;
    data.MQTTVersion = 3;
    data.clientID.cstring = clientId;

    int attemptCount = 1;
    int delayTime = 0;
    while ((rc = client.connect(data)) != 0) {
      Serial.print("Connection Attempt #");
      Serial.print(attemptCount);
      delayTime = reconnect_delay(attemptCount++);
      Serial.print(". Retry in ");
      Serial.print(delayTime);
      Serial.println(" sec(s)");
      delay(delayTime*1000);
    }
    Serial.println("Connected\n");
  }
  char json[60];
  
  sprintf(json,"{\"d\":{\"myName\":\"My Galileo\",\"cputemp\":%.2f}}",getTemp());

  Serial.println(json);
  MQTT::Message message;
  message.qos = MQTT::QOS0; 
  message.retained = false;
  message.payload = json; 
  message.payloadlen = strlen(json);
  rc = client.publish(topic, message);
  if (rc != 0) {
    Serial.print("Message publish failed with return code : ");
    Serial.println(rc);
  }
  //yield does not work for Galileo. So using delay
  //client.yield(1000);
  delay(2000);
}

float getTemp(void) {
  char cputemploc[255] = "/sys/class/thermal/thermal_zone0/temp";
  FILE * cputemp = NULL;
  char buffer [8];
  long tempinmillic;
  float tempinc;

  memset(buffer, 0, sizeof(buffer));
  cputemp = fopen(cputemploc, "r");

  fgets(buffer, 8, cputemp);

  tempinmillic = atol(buffer);
  tempinc = tempinmillic * 1.0 / 1000.0;

  fclose(cputemp);
  return tempinc;
}

/* Reconnect delay time 
 * depends on the number of failed attempts
 */
int reconnect_delay(int i) {
	if (i < 10) {
		return 3; // first 10 attempts try within 3 seconds
	}
	if (i < 20)
		return 60; // next 10 attempts retry after every 1 minute

	return 600;	// after 20 attempts, retry every 10 minutes
}

