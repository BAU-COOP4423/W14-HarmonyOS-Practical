import {P2pClient, Message, Builder} from './wearengine.js'
import {packageName, fingerPrint} from './constants.js';
var p2pClient = new P2pClient()
p2pClient.setPeerPkgName(packageName);
p2pClient.setPeerFingerPrint(fingerPrint);

var SingleP2P = (function () {
    var client = p2pClient;
    var isPingSuccess = false;
    var isMessageSent = false;

    function SingleP2P() {}

    SingleP2P.prototype.checkPhoneIsAlive = function () {
        client.ping({
            onSuccess: () => {
                console.log('Ping success.');
                isPingSuccess = true;
            },
            onFailure: () => {
                console.log('Ping failed.');
                isPingSuccess = false
            },
            onPingResult: (resultCode) => {
                console.log('Data: ' + resultCode.data + ' Code: ' + resultCode.code);
            }
        });
        return isPingSuccess;
    };

    SingleP2P.prototype.sendMessage = (message) => {
        let builder = new Builder();
        builder.setDescription(message);
        let sendMessage = new Message(message);
        sendMessage.builder = builder;
        client.send(sendMessage,
        {
            onSuccess: () => {
                console.log(`Sent ${message}`);
                isMessageSent = true;
            },
            onFailure: () => {
                console.log('Failed to send distance');
                isMessageSent = false;
            },
            onResult: (result) => {
                console.log(`Send result is ${result.data} ${result.code}`);
            },
            onSendProgress: (progress) => {
                console.log(`Send progress is ${progress}`);
            }
        });
        return isMessageSent;
    };
    return SingleP2P;
})();


export {
SingleP2P
};