import { Text, View, Modal, TouchableOpacity, TouchableWithoutFeedback, Alert, StyleSheet} from 'react-native';
import React from 'react'; 
import { UPDATE_VIDEOS, INSERT_BLOCK } from '../../utils/graphql/GraphqlClient';
import { useMutation } from '@apollo/client';
import { colors } from '../../styles/colors';

export default function OptionsModal(props) {
  const [updateVideos, { updateVideosData }] = useMutation(UPDATE_VIDEOS);
  const [insertBlock, { insertBlockData }] = useMutation(INSERT_BLOCK);

  function flagPost(){
    updateVideos({ variables: {id: props.videoId, flags: props.flags + 1}})
    Alert.alert(
      'Thanks for flagging video!', 
      'We remove any objectable content within 24 hours and eject the user.', 
      [{ text: 'Ok!', onPress: () => props.setVisible(!props.visible) }]
    )
  }

  function blockPost(){
    insertBlock({ variables: { blockedId: props.currentUserId, blockerId: props.userId }})
    const filteredUserData = props.videoData.users.filter(user => user.id !== props.currentUserId);
    const filteredVideoData = {'users' : filteredUserData}
    props.setVideoData(filteredVideoData); 
    props.setVisible(!props.visible);
  }

  function removePost(){
    insertBlock({ variables: { blockedId: props.currentUserId, blockerId: props.userId }})
    const filteredUserData = props.videoData.users.filter(user => user.id !== props.currentUserId);
    const filteredVideoData = {'users' : filteredUserData}
    props.setVideoData(filteredVideoData); 
    props.setVisible(!props.visible);
  }

  function cancel(){
    props.setVisible(!props.visible);
  }

  return (

    <Modal
    animationType="slide"
    transparent={true}
    visible={props.visible}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000090'}}>
            <TouchableWithoutFeedback onPress={cancel}>
              <View style={{ height: '73%', width: '100%'}}>
              </View>
            </TouchableWithoutFeedback>

            <View style={{ backgroundColor: colors.primaryPurple, height: '27%', justifyContent: 'space-evenly', alignItems:'center', borderRadius: 5}}>
                <View style={{ height: '60%', justifyContent: 'space-between'}}>
                    <TouchableOpacity onPress={flagPost} style={styles.facebookContainer}>
                        <Text style={styles.facebookText}>Flag Post</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={blockPost} style={styles.facebookContainer}>
                        <Text style={styles.facebookText}>
                          Block User
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={removePost} style={styles.facebookContainer}>
                        <Text style={styles.facebookText}>
                        Remove Post
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View> 
    </Modal>
    // <Modal
    //   animationType="slide"
    //   transparent={false}
    //   visible={props.visible}>
    //   <View style={homeStyles.optionsModalView}>
    //     <TouchableHighlight
    //       onPress={flagPost}>
    //       <Text style={homeStyles.optionsModalButtons}>Flag Post</Text>
    //     </TouchableHighlight>

    //     <TouchableHighlight
    //       onPress={blockPost}>
    //       <Text style={homeStyles.optionsModalButtons}>Block User</Text>
    //     </TouchableHighlight>

    //     <TouchableHighlight
    //       onPress={removePost}>
    //       <Text style={homeStyles.optionsModalButtons}>Remove Post</Text>
    //     </TouchableHighlight>

    //     <TouchableHighlight
    //       onPress={cancel}>
    //       <Text style={homeStyles.optionsModalButtons}>Cancel</Text>
    //     </TouchableHighlight>
    //   </View>
    // </Modal>
  )
}

const styles = StyleSheet.create({
  facebookContainer: { 
      backgroundColor: colors.secondaryWhite, 
      borderRadius: 5,
      width: 225,
      height: 40, 
      justifyContent: 
      'center', 
      alignItems: 'center'
  }, 
  facebookText: {
      fontSize: 17,
      color: colors.primaryBlack
  }
})
