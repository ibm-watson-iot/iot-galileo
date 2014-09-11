iot-galileo
===========

This is a sample client for the Intel Galileo.

Using the this code and the recipe at https://developer.ibm.com/iot/recipes/intel-galileo/
you can run an Ardiuno Sketch program to send cpu temperature data to the IBM Internet of Things Foundation Cloud.

### Use the following steps to setup and run the sample


####Setup the Galileo Board

- Complete steps 1 – 3 in the [Intel Galileo Getting Started Guide](https://communities.intel.com/community/makers/galileo/getting-started). The Step-by-step Tools section  include steps for connecting your board to a Windows, Mac, or Linux computer using a USB cable.
- Connect your board to an internet connected network using an Ethernet cable.

###Setup the Sketch code

- Download the sketch code from [here](https://github.com/jeffdare/iot-galileo/releases/tag/v0.2.0) and extract the contents
- Follow step 2 in the Intel Galileo Getting Started Guide to launch the Arduino integrated development environment (IDE)

#####Connect(Quickstart)

- In the IDE, select **File > Open**, navigate the extracted directory and select *iot_galileo_quickstart/iot_galileo_quickstart.ino* file. 
- The Intel Galileo board has a sticker on it showing a MAC address. Note down this value and modify the Sketch app code with the MAC address. Update the mac[] and deviceId[] fields
- Select **File > Upload** to load and run the QuickStart program on your board.
- Select **Tools > Serial Monitor**. When your board is connected to the Internet of Things Cloud, the monitor window displays the events that are published to the IoT Cloud. 

#####Visualize

Visit the [IBM Internet of Things QuickStart Portal](http://quickstart.internetofthings.ibmcloud.com/) and enter the MAC address of your board to see real time visualizations of the data.


#####Connect(Registered)

- Register for the [Internet of Things Beta](http://internetofthings.ibmcloud.com/) and select to add a device into an organisation. Alternatively select to add a device from QuickStart.
- Make a note of the file configuration information that you receive during the device registration process for the following values:
		Organization ID
		Device Type ID
		Device ID
		Authentication Method
		Authentication Token

- In the IDE, select **File >Open**, navigate to the extracted sketch files and select *iot_galileo_registered\iot_galileo_registered.ino*
- The Intel Galileo board has a sticker on it showing a MAC address. Note down this value and modify the Sketch app code with the MAC address. Update the mac[] field.
- Modify the configuration information in the iot_galileo_registered.ino file with the values you noted when you registered your board.
- Select **File > Upload** to load and run the Registered program on your board.
- Select **Tools > Serial Monitor**. When your board is connected to the Internet of Things Cloud, the monitor window displays the events that are published to the IoT Cloud. 


#####Command Support(Registered)

Intel Galileo Sample running in registered mode supports receipt of commands sent by an application. 

- Intel Galileo supports **Blink**
- Application should send the **blink** in the following format
		
		Topic : iot-2/type/<type>/id/<id>/cmd/blink/fmt/json
		Payload : Any payload
- When the board receives the command, the led blinks thrice.
