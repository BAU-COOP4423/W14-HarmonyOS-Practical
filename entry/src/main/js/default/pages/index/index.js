import geolocation from '@system.geolocation';
import battery from '@system.battery';
import router from '@system.router';
import app from '@system.app'
import {packageName, fingerPrint} from '../common/constants.js';
import {P2pClient, Message, Builder} from '../common/wearengine.js'

var messgeClient = new P2pClient();
var infoClient = new Message();
var builderClient = new Builder();


export default {
    data: {
        index: 0,
        latlon: "",
        accuracy: 0,
        battery: 0,
        percentage: 0,
        receiveMessage: 'Received message',
        desc: "No Info",
        errorMessage:"",
        },
    updateData() {
        var anchor = this;
        geolocation.getLocation({
            success: function (data) {
                anchor.latlon = "\n" + data.latitude + "\n" + data.longitude;
                anchor.accuracy = data.accuracy;
                anchor.desc = "Got location"
            },
            fail: function(data, code) {
                console.log('Failed to get location. Data: ' + data
                + ' Code: ' + code);
                this.desc = code;
            }

        })
        battery.getStatus({
            success: function (data) {
                anchor.battery = data.level;
            }
        })
    },
    onInit() {
        messgeClient.setPeerPkgName(packageName);
        messgeClient.setPeerFingerPrint(fingerPrint);
        this.updateData();
        this.registerMessage();
    },
    onDestroy() {},
    registerMessage() {
        var flash = this;
        console.log('Register message button click');
        flash.operateMessage = "Register message button click";
        messgeClient.registerReceiver({
            onSuccess: function () {
                flash.receiveMessage = "Message receive success";
            },
            onFailure: function () {
                flash.receiveMessage = "Message receive fail";
            },
            onReceiveMessage: function (data) {
                if (data && data.isFileType) {
                    flash.receiveMessage = "Receive file name:" + data.name;
                }else{
                    flash.receiveMessage = "Receive message info:" + data;
                }
            },
        });
    },
    unregisterMessage() {
        this.operateMessage = "Register message button click";
        var flash = this;
        messgeClient.unregisterReceiver({
            onSuccess: function () {
                flash.operateMessage = "Stop receiving messages is sent";
            },
        });
    },
    sendMessage() {
        builderClient.setDescription(this.latlon);
        infoClient.builder = builderClient;
        this.registerMessage();
        console.log("testBuilder" + infoClient.getData());
        var flashlight = this;
        messgeClient.send(infoClient, {
            onSuccess: function () {
                flashlight.operateMessage = "Message sent successfully";
                flashlight.errorMessage = " ";
            },
            onFailure: function () {
                flashlight.operateMessage = "Failed to send message";
                flashlight.errorMessage = "Open app or retry later.";
            },
            onSendResult: function (resultCode) {
                console.log("ResultCodes" + resultCode.data + resultCode.code);


            },
            onSendProgress: function (count) {
                console.log(count);
            },
        });

    },
    navigate(){
        router.replace({
            uri: 'pages/index/index'
        })
    },
    sendFile() {
        var testFile = {
            "name" : "",
            "mode" : "",
            "mode2" : "",
        };

        builderClient.setPayload(testFile);
        console.log("setPayload");

        infoClient.builder = builderClient;
        this.operateMessage = "Send file button click";
        console.log("testFileBuilder: " + infoClient.getFile().name);
        var flashlight = this;

        messgeClient.send(infoClient,{
            onSuccess: function() {
                flashlight.operateMessage = "File sent successfully";
            },
            onFailure: function() {
                flashlight.operateMessage = "Failed to send file";
            },
            onSendResult: function(resultCode) {
                console.log(resultCode.data + resultCode.code);
            },
            onSendProgress: function(count) {
                console.log("Progress:" + count);
            },
        });
    },
    pingRight() {
        console.log("ping right");
        var flashlight = this;
        messgeClient.setPeerPkgName(packageName);
        messgeClient.setPeerFingerPrint(fingerPrint);
        flashlight.operateMessage = "Ping correct APP";
        messgeClient.ping({
            onSuccess: function () {
                flashlight.operateMessage = flashlight.operateMessage + "success";
            },
            onFailure: function () {
                flashlight.operateMessage = flashlight.operateMessage + "fail";
            },
            onPingResult: function (resultCode) {
                flashlight.operateMessage = "result code:" + resultCode.code + ", the app already have installed";
            },
        });

    },
    pingFalse() {
        console.log("ping false");
        var flashlight = this;
        messgeClient.setPeerPkgName(packageName);
        messgeClient.setPeerFingerPrint(fingerPrint);
        flashlight.operateMessage = "Ping wrong APP";
        messgeClient.ping({
            onSuccess: function () {
                flashlight.operateMessage = flashlight.operateMessage + "success";
            },
            onFailure: function () {
                flashlight.operateMessage = flashlight.operateMessage + "fail";
            },
            onPingResult: function (resultCode) {
                flashlight.operateMessage = "result code:" + resultCode.code + ", the app not installed";
            },
        });

    },
    swipeEvent(e) {
        if (e.direction == "right") {
            app.terminate();
        }
    }
}
