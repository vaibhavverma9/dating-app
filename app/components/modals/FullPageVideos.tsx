import { TouchableOpacity, View, Modal, Text } from 'react-native';
import React from 'react'; 
import SingleVideo from '../videosPage/SingleVideo';
import { BlurView } from 'expo-blur';
import { fullPageVideoStyles } from '../../styles/fullPageVideoStyles';
import { colors } from '../../styles/colors';

export default function FullPageVideos(props) {

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={props.visible}>
      <View style={{ flex: 1, backgroundColor: colors.primaryBlack }}>
          <TouchableOpacity onPress={() => { props.setVisible(false) }}>
              <SingleVideo
                key={props.source}
                source={props.source}
                shouldPlay
              >
              </SingleVideo>
          </TouchableOpacity>
          <BlurView tint="dark" intensity={20} style={fullPageVideoStyles.questionContainer}>
            <Text style={{fontSize: 18,color: "#eee", padding: 15, textAlign: 'center'}}>{props.questionText}</Text>
          </BlurView>
      </View>
      </Modal>
  );
}