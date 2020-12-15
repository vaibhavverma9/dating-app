import React, { useContext, useState, useEffect } from 'react';
import { UserIdContext } from '../../utils/context/UserIdContext';
import { connectUser, getChannel, initializeChannels } from '../../utils/sendBird'; 
import { Text, SafeAreaView, StatusBar, View } from "react-native";
import { FlatList, TouchableOpacity} from 'react-native-gesture-handler';
import { Divider } from 'react-native-paper';
import { useSubscription } from '@apollo/client';
import { ON_MATCHES_UPDATED } from '../../utils/graphql/GraphqlClient';
import { ChannelCell } from './ChannelCell';

const ChannelListView = (props) => {
    
  // const [userId, setUserId] = useContext(UserIdContext);
  const userId = 1558; 
  const appId = 'DF76D20F-E9BA-49D1-8BF2-B2F28A901921'; 
  const name = 'Vaibhav';  
  const [groupChannels, setGroupChannels] = useState([]); 

  let ACCESS_TOKEN = "230951e3cc455a79d83ca78861556f1b80b13f8c"

  const { data } = useSubscription(ON_MATCHES_UPDATED, { variables: { userId }});    

  useEffect(() => {
    connectUser(userId.toString(), ACCESS_TOKEN, appId); 
    initializeChannels(setGroupChannels); 
  }, []);

  const ItemSeparator = () => {
    return (
        <View style={{ padding: '5%'}}>
            <Divider /> 
        </View>
    );
  }

  return  (
    <SafeAreaView style={{ flex: 1, marginTop: StatusBar.currentHeight || 0,}}>
      <Text style={{ fontSize: 27, fontWeight: '500', paddingLeft: '5%' }}>Matches</Text>
      <FlatList
          data={groupChannels}
          renderItem={({ item, index }) => <ChannelCell userId={userId} url={item.url} members={item.members} lastMessage={item.lastMessage} cachedReadReceiptStatus={item.cachedReadReceiptStatus} index={index} navigation={props.navigation} matchesData={data} />}          
          keyExtractor={(item, index) => index.toString()}
          ItemSeparatorComponent={ItemSeparator}
      />
    </SafeAreaView>
  )

};

export default ChannelListView;