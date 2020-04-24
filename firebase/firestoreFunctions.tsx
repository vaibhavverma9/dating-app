import 'firebase/firestore'; 
import firebase from './fbConfig';

const db = firebase.firestore(); 

export const usersQuery = (limit: number) => {
    return db.collection('users').limit(limit).get(); 
}   

export const questionQuery = (questionId: string) => {
    return db.collection('questions').doc('/questions/' + questionId).get();
}

export const videosQuery = (userId: string, limit: number) => {
    return db.collection('videos').where('userId', '==', userId).limit(limit).get();
}