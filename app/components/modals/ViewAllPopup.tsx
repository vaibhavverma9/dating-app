import { View, Modal, Text, TouchableHighlight, StyleSheet } from 'react-native';
import React from 'react'; 
import { TouchableWithoutFeedback, FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import { colors } from '../../styles/colors';
import { Divider } from 'react-native-paper';

export default function ViewAllPopup(props) {

    function onScreenPress(){
        props.setVisible(false); 
    }   

    function Item({ question, index }) {

        function setQuestion(){
            props.setIndex(index); 
            props.setVisible(false); 
        }

        return (
            <TouchableOpacity onPress={setQuestion} >
                <Text style={{ color: colors.primaryBlack}}>{question}</Text>
            </TouchableOpacity>
        );
    };

    const ItemSeparator = () => {
    return (
        <View style={{ padding: '5%'}}>
            <Divider /> 
        </View>
    );
    }
    

    return (
        <Modal
        animationType="slide"
        transparent={true}
        visible={props.visible}>

            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000090'}}>
                <TouchableWithoutFeedback onPress={onScreenPress}>
                    <View style={{ height: '80%', width: '100%'}}>
                    </View>
                </TouchableWithoutFeedback>
                <View style={{ backgroundColor: colors.primaryWhite, padding: 16, height: '100%', justifyContent: 'flex-start', alignItems:'center', borderRadius: 4}}>
                    <View style={{ flexDirection: 'row'}}>
                        <Text style={{ color: colors.primaryBlack, paddingTop: 25, fontSize: 20, fontWeight: '500' }}>Select a Prompt</Text>
                    </View>
                    <FlatList
                        data={props.questionData}
                        renderItem={({ item, index }) => <Item question={item.questionText} index={index} />}
                        keyExtractor={item => item.id.toString()}
                        style={{ paddingTop: 30 }}
                        ItemSeparatorComponent={ItemSeparator}
                    />
                </View>
            </View> 
        </Modal>
    );
}