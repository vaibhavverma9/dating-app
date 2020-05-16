import { Text, View, Modal, TouchableHighlight, Alert } from 'react-native';
import React from 'react'; 
import { homeStyles } from '../../styles/homeStyles';
import { UPDATE_VIDEOS, INSERT_BLOCK } from '../../utils/graphql/GraphqlClient';
import { useMutation } from '@apollo/client';

export default function OptionsModal(props) {
  const [updateVideos, { updateVideosData }] = useMutation(UPDATE_VIDEOS);
  const [insertBlock, { insertBlockData }] = useMutation(INSERT_BLOCK);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={props.visible}>
      <View style={homeStyles.optionsModalView}>
        <TouchableHighlight
          onPress={() => {
            updateVideos({ variables: {id: props.videoId, flags: props.flags + 1}})

            Alert.alert(
              'Thanks for flagging video!', 
              'We remove any objectable content within 24 hours and eject the user.', 
              [{ text: 'Ok!', onPress: () => props.setVisible(!props.visible) }]
            )
          }}>
          <Text style={homeStyles.optionsModalButtons}>Flag Post</Text>
        </TouchableHighlight>

        <TouchableHighlight
          onPress={() => {
            insertBlock({ variables: { blockedId: props.currentUserId, blockerId: props.userId }})
            const filteredUserData = props.videoData.users.filter(user => user.id !== props.currentUserId);
            const filteredVideoData = {'users' : filteredUserData}
            props.setVideoData(filteredVideoData); 
            props.setVisible(!props.visible);
          }}>
          <Text style={homeStyles.optionsModalButtons}>Block User</Text>
        </TouchableHighlight>

        <TouchableHighlight
          onPress={() => {
            insertBlock({ variables: { blockedId: props.currentUserId, blockerId: props.userId }})
            const filteredUserData = props.videoData.users.filter(user => user.id !== props.currentUserId);
            const filteredVideoData = {'users' : filteredUserData}
            props.setVideoData(filteredVideoData); 
            props.setVisible(!props.visible);
          }}>
          <Text style={homeStyles.optionsModalButtons}>Remove Post</Text>
        </TouchableHighlight>

        <TouchableHighlight
          onPress={() => {
            props.setVisible(!props.visible);
          }}>
          <Text style={homeStyles.optionsModalButtons}>Cancel</Text>
        </TouchableHighlight>
      </View>
    </Modal>
  )
}