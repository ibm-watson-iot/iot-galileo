#include <SPI.h>
#include <Ethernet.h>
#include <EthernetStack.h>
#include <Countdown.h>
#include <MQTTClient.h>

#define MQTT_MAX_PACKET_SIZE 100
#define SIZE 100

//MODIFY the following property to the mac address 
//of your Intel Galileo. It can be found on the sticker on the device.
byte mac[] = { 0x98, 0x4F, 0xEE, 0x00, 0x90, 0x5D };

//MODIFY the following properties based on the values that 
//you have registered on the IoTFoundation cloud.
char organization[] = "zbicf";
char typeId[] = "iotsample-galileo";
char deviceId[] = "9388uieurr8";
char authMethod[] = "use-token-auth";
char authToken[] = "r2d7!AZDw!U9PjZc?f";

int mqttPort = 1883;
//The convention to be followed is d:quickstart:iotsample-galileo:<MAC Address>
char clientId[SIZE];
char registeredUrl[SIZE];
char topic[] = "iot-2/evt/status/fmt/json";
char subTopic[] = "iot-2/cmd/+/fmt/json";

EthernetStack ipstack;  
MQTT::Client<EthernetStack, Countdown, MQTT_MAX_PACKET_SIZE> client(ipstack);
void messageArrived(MQTT::MessageData& md);

void setup() {
  system("/etc/init.d/networking restart");
  Serial.begin(9600);
  Ethernet.begin(mac);
  //build the mqtt url and the client id
  sprintf(clientId, "d:%s:%s:%s", organization, typeId, deviceId);
  sprintf(registeredUrl,"%s.messaging.internetofthings.ibmcloud.com",organization);
  delay(2000);
}

void loop() {
  int rc = -1;
  if (!client.isConnected()) {
    Serial.print("Connecting to Registered mode with clientid : ");
    Serial.println(clientId);
    while (rc != 0) {
      rc = ipstack.connect(registeredUrl, mqttPort);
    }
    MQTTPacket_connectData options = MQTTPacket_connectData_initializer;
    options.MQTTVersion = 3;
    options.clientID.cstring = clientId;
    options.username.cstring = authMethod;
    options.password.cstring = authToken;
    options.keepAliveInterval = 10;
    rc = -1;
    while ((rc = client.connect(options)) != 0)
      ;
    Serial.println("Connected\n");
    
    //unsubscribe the topic, if it had subscribed it before.
    client.unsubscribe(subTopic);
    //Try to subscribe for commands
    if ((rc = client.subscribe(subTopic, MQTT::QOS0, messageArrived)) != 0) {
            Serial.print("Subscribe failed with return code : ");
            Serial.println(rc);
    }
    Serial.println("Subscribed\n");
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
  client.yield(10);
  //delay(2000);
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
// Pin 13 has an LED connected on most Arduino boards.
int led = 13;

void messageArrived(MQTT::MessageData& md) {
  Serial.print("Received command : ");
    MQTT::Message &message = md.message;
    
    char* topic = new char[md.topicName.lenstring.len + 1];
    sprintf(topic, "%.*s", md.topicName.lenstring.len, md.topicName.lenstring.data);
    
    char* payload = new char[message.payloadlen + 1];
    sprintf(payload, "%.*s", message.payloadlen, (char*)message.payload);
    
    String topicStr = topic;
    String payloadStr = payload;
    
    //Command topic: iot-2/cmd/blink/fmt/json
    String cmd = topicStr.substring(10, topicStr.indexOf("/fmt/"));
    
    Serial.println(cmd);
    
    if( cmd != "blink") {
      Serial.print("Unsupported command :");
      Serial.println(cmd);
      Serial.println("Only blink command supported now");
      return;
    }
    
    // initialize the digital pin as an output.
    pinMode(led, OUTPUT);
    
    //Blink thrice
    for(int i = 0 ; i < 3 ; i++ ) {
      digitalWrite(led, HIGH);
      delay(500);
      digitalWrite(led, LOW);
      delay(500);
    }
}

