import { Text, View, Modal, TouchableHighlight, Alert } from 'react-native';
import React, { useEffect } from 'react'; 
import { homeStyles } from '../../styles/homeStyles';
import { UPDATE_VIDEOS, INSERT_BLOCK } from '../../utils/graphql/GraphqlClient';
import { useMutation } from '@apollo/client';

export default function MessagesOptions(props) {
  const [updateVideos, { updateVideosData }] = useMutation(UPDATE_VIDEOS);
  const [insertBlock, { insertBlockData }] = useMutation(INSERT_BLOCK);

  function blockUser(){
    insertBlock({ variables: { blockedId: props.currentUserId, blockerId: props.userId }});
    const filteredData = props.allData.filter((like) => { return like.likerId != props.currentUserId });
    props.setAllData(filteredData); 
    props.setVisible(!props.visible);
  }

  function removeUser(){
    insertBlock({ variables: { blockedId: props.currentUserId, blockerId: props.userId }});
    props.setVisible(!props.visible);
  }

  function cancel(){
    props.setVisible(!props.visible);
  }

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={props.visible}>
      <View style={homeStyles.optionsModalView}>

        <TouchableHighlight
          onPress={blockUser}>
          <Text style={homeStyles.optionsModalButtons}>Block User</Text>
        </TouchableHighlight>

        <TouchableHighlight
          onPress={removeUser}>
          <Text style={homeStyles.optionsModalButtons}>Remove User</Text>
        </TouchableHighlight>

        <TouchableHighlight
          onPress={cancel}>
          <Text style={homeStyles.optionsModalButtons}>Cancel</Text>
        </TouchableHighlight>
      </View>
    </Modal>
  )
}