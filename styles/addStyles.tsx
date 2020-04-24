import { StyleSheet } from 'react-native'; 

export const addStyles = StyleSheet.create({
    container: {
        flex: 1, 
        flexDirection: 'column', 
        justifyContent: 'space-evenly'
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
    }
});