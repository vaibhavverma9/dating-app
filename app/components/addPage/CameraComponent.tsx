import React from 'react'; 
import { Camera } from 'expo-camera';
import { View, Text, TouchableOpacity } from 'react-native'; 

class CameraComponent extends React.Component { 

    constructor(props) {
        super(props);
        this.state = {
            type: Camera.Constants.Type.back
        }
    }
    render(){
        return (
            <Camera 
                style={{ flex: 1 }} 
                type={this.state.type}
                ref={ref => (
                    camera = ref
                )}
            >
                <View
                style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    flexDirection: 'row',
                }}>
                <View style={{ alignSelf: 'flex-end', alignItems: 'center', padding: 20, flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                    <MaterialIcons name="video-library" onPress={pickVideo} color={"#eee"} size={45}/>     
                    <RecordingIcon />    
                    <Ionicons name="ios-reverse-camera" onPress={setCameraType} color={"#eee"} size={45}/>                     
                </View>
                </View>
            </Camera>
        )
    }
}