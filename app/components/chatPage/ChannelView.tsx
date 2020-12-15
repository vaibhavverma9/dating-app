import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, StyleSheet, Keyboard } from 'react-native';
import { getMessages, sendMessage, addChannelHandler, removeChannelHandler } from '../../utils/sendBird'; 
import { FlatList, TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { colors } from '../../styles/colors';
import { Ionicons } from '@expo/vector-icons'

export default function ChannelView(props){
    const name = props.route.params.name;
    const url = props.route.params.url; 
    const userId = props.route.params.userId; 
    const [messages, setMessages] = useState([]); 
    const [inputMessage, setInputMessage] = useState(''); 
    const [sendButtonColor, setSendButtonColor] = useState(colors.lightPurple); 

    useEffect(() => {
        getMessages(url, setMessages); 
        // addChannelHandler('3', addNewMessage); 
        // return function cleanup(){
        //     removeChannelHandler('3'); 
        // }
    }, []); 

    // function addNewMessage(message){
    //     console.log("addNewMessage", message); 
        // setMessages([...messages, message]); 
    // }

    useEffect(() => {
        if(inputMessage == ''){
            setSendButtonColor(colors.lightPurple); 
        } else {
            setSendButtonColor(colors.primaryPurple); 
        }
    }, [inputMessage]); 

    function Message({item}){
        if(item._sender){
            if(item._sender.userId == props.route.params.userId.toString()){
                return (
                    <View style={{ ...styles.messageStyle, alignSelf: 'flex-end', backgroundColor: colors.lightPurple }}>
                        <Text>{item.message}</Text>
                    </View>
                )    
            } else {
                return (
                    <View style={{ ...styles.messageStyle, backgroundColor: colors.secondaryGray }}>
                        <Text>{item.message}</Text>
                    </View>
                )       
            }
        } else {
            return (
                <View style={{ ...styles.messageStyle, backgroundColor: colors.lightGray }}>
                    <Text>{item.message}</Text>
                </View>
            )    
        }
    }

    function send(){
        sendMessage(url, inputMessage);
        setInputMessage(''); 
    }

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS == "ios" ? "padding" : "height"}
            style={{ flex: 1, marginTop: '10%' }}
        >
            {/* Put header here */}
            {/* <View>
                <Text>Carina</Text>
            </View> */}
            <FlatList
                style={{ marginTop: 5, marginHorizontal: '5%' }}
                data={messages}
                renderItem={({ item, index }) => <Message item={item} />}
                keyExtractor={(item, index) => index.toString()}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput 
                    style={{ 
                        padding: 6,
                        paddingLeft: 12,
                        margin: 5,
                        textAlign: 'left', 
                        fontSize: 16, 
                        color: colors.primaryBlack,  
                        borderColor: colors.primaryPurple,
                        borderWidth: 1,
                        height: 40,
                        borderRadius: 20, 
                        width: '80%'                       
                    }}
                    placeholder="Aa"
                    placeholderTextColor={colors.lightPurple}
                    selectionColor={colors.primaryPurple}
                    onChangeText={text => setInputMessage(text)}
                    value={inputMessage}
                />
                <TouchableOpacity style={{ paddingLeft: 8}} onPress={send}>
                    <Ionicons name="md-send" color={sendButtonColor} size={35} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    messageStyle: { 
        maxWidth: '70%', 
        borderRadius: 10, 
        padding: 5,
        marginVertical: 3
    },
});