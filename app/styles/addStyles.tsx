import { StyleSheet } from 'react-native'; 

export const addStyles = StyleSheet.create({
    container: {
        flex: 1, 
        flexDirection: 'column', 
        justifyContent: 'space-evenly',
        backgroundColor: '#734f96'
    },
    questionArrowContainer: {
        // flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    }, 
    questionContainer: {
        width: '70%',
        alignItems: 'center'
    },
    questionText: {
        textAlign: 'center'
    },
    uploadContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        flexDirection: 'row'
        // height: '15%'
    }
});