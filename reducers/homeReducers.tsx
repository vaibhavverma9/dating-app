// { user: { userId: , firstName: , lastName: }} 
// { video: { muxPlaybackid: , userId: , questionId: }}
// { question: { questionId: , questionText: }}

const initialVideos = {
    users: [],
    videos: [],
    questions: []
}

function videoReducer(state, action) {
    switch (action.type) {
        case 'new_user':
            console.log("video for new user");
        case 'existing_user':
            console.log("video for existing user");
        default:
            throw new Error(); 
    }
}