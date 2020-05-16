import { StyleSheet } from 'react-native'; 

export const fullPageVideoStyles = StyleSheet.create({
    questionArrowsContainer: {
        ...StyleSheet.absoluteFill, 
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: '10%',
        height: '20%'
    },
    questionContainer: {
        ...StyleSheet.absoluteFill, 
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '15%'
    },

});