import axios from 'axios';
import SendBird from 'sendbird'; 

export async function createUser( userId, nickname, profile_url ){
    try{
        const res = await axios({
            method: "post", 
            headers: { 'Content-Type': 'application/json', 'Api-Token': '2296335051ffbf1f1df923c40796a1d2f82e075a' },
            url: "https://api-DF76D20F-E9BA-49D1-8BF2-B2F28A901921.sendbird.com/v3/users",
            data: { "user_id" : userId.toString(), "nickname" : nickname, "profile_url" : profile_url, "issue_access_token": "true" }
          }); 
    } catch(error){
        console.log("createUser", error); 
    }
}

export function connectUser(USER_ID, ACCESS_TOKEN, APP_ID){
    var sb = new SendBird({appId: APP_ID});
    sb.connect(USER_ID, ACCESS_TOKEN, function(user, error) {
      if(error){
        console.log("error", error); 
      }
    });
    return sb; 
}; 

export function initializeChannels(setChannels){
    var sb = SendBird.getInstance(); 
    var channelListQuery = sb.GroupChannel.createMyGroupChannelListQuery();
    channelListQuery.includeEmpty = true;
    channelListQuery.order = 'latest_last_message'; // 'chronological', 'latest_last_message', 'channel_name_alphabetical', and 'metadata_value_alphabetical'
    channelListQuery.limit = 15;    // The value of pagination limit could be set up to 100.

    if (channelListQuery.hasNext) {
      channelListQuery.next(function(groupChannels, error) {
          if (error) {
              return;
          }
          setChannels(groupChannels); 
          return;
      });
    } else {
        return; 
    }
}

export function getMessages(CHANNEL_URL, setMessages){
    var sb = SendBird.getInstance(); 
    sb.GroupChannel.getChannel(CHANNEL_URL, function(groupChannel, error) {
        if (error) {
            return;
        }

        var prevMessageListQuery = groupChannel.createPreviousMessageListQuery();
        prevMessageListQuery.limit = 15;
        prevMessageListQuery.reverse = false;
        
        prevMessageListQuery.load(function(messages, error) {
            if (error) {
                return;
            }    
            setMessages(messages); 
        });
    
    });
}

export function sendMessage(CHANNEL_URL, TEXT_MESSAGE){
    var sb = SendBird.getInstance(); 

    sb.GroupChannel.getChannel(CHANNEL_URL, function(groupChannel, error) {
        if (error) {
            console.log(error); 
            return;
        }

        const params = new sb.UserMessageParams();
        params.message = TEXT_MESSAGE;
        params.pushNotificationDeliveryOption = 'default';
    
        groupChannel.sendUserMessage(params, function(message, error) {
            if (error) {
                console.log(error); 
                return;
            }        
        });
    }); 
}

export function addChannelHandler(UNIQUE_HANDLER_ID, addNewMessage){
    var sb = SendBird.getInstance(); 
    var channelHandler = new sb.ChannelHandler();

    channelHandler.onMessageReceived = function(channel, message) {
        addNewMessage(message)
    };

    sb.addChannelHandler(UNIQUE_HANDLER_ID, channelHandler);
}

export function removeChannelHandler(UNIQUE_HANDLER_ID){
    var sb = SendBird.getInstance(); 
    sb.removeChannelHandler(UNIQUE_HANDLER_ID);
}