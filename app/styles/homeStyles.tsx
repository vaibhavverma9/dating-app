import { StyleSheet } from 'react-native'; 

export const homeStyles = StyleSheet.create({
    questionContainer: {
        ...StyleSheet.absoluteFill, 
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '15%'
    },
    optionsModalButtons: {
        fontSize: 24,
        paddingTop: '5%'
    },
    optionsModalView: {
        alignItems: 'center', 
        justifyContent: 'center',
        height: '90%'
    },
    progressBarContainer: {
        position: 'absolute',
        top: '15%',
        left: 0,
        right: 0,
        flexDirection: 'row'
    }
});