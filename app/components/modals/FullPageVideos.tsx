import { TouchableOpacity, View, Modal, Text, StyleSheet} from 'react-native';
import React, { useEffect, useState } from 'react'; 
import SingleVideo from '../videosPage/SingleVideo';
import { BlurView } from 'expo-blur';
import { fullPageVideoStyles } from '../../styles/fullPageVideoStyles';
import { colors } from '../../styles/colors';
import { SimpleLineIcons, Ionicons, MaterialIcons } from '@expo/vector-icons'
import { useMutation } from '@apollo/client';
import { DELETE_VIDEO } from '../../utils/graphql/GraphqlClient';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

export default function FullPageVideos(props) {

  const [views, setViews] = useState(null); 
  const [likes, setLikes] = useState(null); 
  const [showDelete, setShowDelete] = useState(false); 
  const [showOptions, setShowOptions] = useState(false); 
  const [deleteVideo, { deleteVideoData }] = useMutation(DELETE_VIDEO); 

  useEffect(() => {
    if(props.views){
      setViews(props.views); 
    }
    if(props.likes){
      setLikes(props.likes); 
    }
    if(props.showOptions){
      setShowOptions(true); 
    }
  }, [props]); 

  function ViewsLikes() {
    if(likes && views){
      return(
        <View style={{ alignItems: 'center', flexDirection: 'row'}}>
            <Ionicons name='md-heart' color={colors.secondaryWhite} size={45} />        
            <Text style={{ color: colors.secondaryWhite, paddingLeft: 10 }}>{likes}</Text>
        </View>
      )        
    } else {
      return null; 
    }
  }

  function touchScren(){
    if(showDelete){
      setShowDelete(false); 
    } else {
      props.setVisible(false); 

    }
  }

  function moreOptions(){
    setShowDelete(true); 
  }

  function tapDeleteVideo(){
    deleteVideo({ variables: { videoId: props.videoId }}); 
    props.removeVideo(props.videoId); 
    props.setVisible(false); 
  }

  function Options(){
    if(showOptions) {
      return (
        <TouchableOpacity onPress={moreOptions}>
          <Ionicons name='ios-more' size={45} color={colors.secondaryWhite} />        
        </TouchableOpacity>
      )
    } else {
      return null;
    }
  }

  function Delete(){
    if(showDelete) {
      return (
        <View style={{ ...StyleSheet.absoluteFill, justifyContent: 'flex-end', height: '100%'}}>
          <View style={{ height: '15%', justifyContent: 'space-evenly', backgroundColor: colors.secondaryBlack, borderRadius: 5, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={tapDeleteVideo} style={{ justifyContent: 'center', alignItems: 'center' }}>
              <MaterialIcons name='delete' size={40} color={colors.secondaryWhite} />        
              <Text style={{ color: colors.secondaryWhite, fontSize: 17, fontWeight: '500', alignSelf: 'center'}}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    } else {
      return null; 
    }
  }

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={props.visible}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: colors.primaryBlack }} onPress={touchScren}>
          <SingleVideo
            key={props.source}
            source={props.source}
            shouldPlay
          />
          <View style={fullPageVideoStyles.likesViewsContainer}>
            <View style={{alignItems: 'flex-end'}}>
              <ViewsLikes />
              <Options />
            </View>
          </View>
          <Delete />

          <ViewsLikes /> 
          <BlurView tint="dark" intensity={20} style={fullPageVideoStyles.questionContainer}>
            <Text style={{fontSize: 18,color: "#eee", padding: 15, textAlign: 'center'}}>{props.questionText}</Text>
          </BlurView>
      </TouchableOpacity>
      </Modal>
  );
}