import React, { useContext, useState, useEffect } from 'react'; 
import AuctionContents from './AuctionContents';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator, StyleSheet, TextInput, Keyboard } from 'react-native'; 
import { colors } from '../../styles/colors';
import { Ionicons, Feather } from '@expo/vector-icons';
import Autocomplete from 'react-native-autocomplete-input';
import { useLazyQuery, useMutation } from '@apollo/client';
import { GET_COLLEGES, INSERT_AUCTIONED_USER, INSERT_AUCTION, GET_AUCTIONED_USERS, UPDATE_AUCTIONED_USER } from '../../utils/graphql/GraphqlClient';
import { _retrieveCity, _retrieveRegion } from '../../utils/asyncStorage'; 
import { Divider } from 'react-native-paper';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { SwipeListView } from 'react-native-swipe-list-view';
import * as Segment from 'expo-analytics-segment';
import { AntDesign } from '@expo/vector-icons'

export default function AuctionOnboarding(props) {

    const [userId, setUserId] = useContext(UserIdContext);
    const [auctionedId, setAuctionedId] = useState(0);
    const [onboardingStage, setOnboardingStage] = useState('Home');
    const [name, setName] = useState(''); 
    const [instagram, setInstagram] = useState('');
    const [genderNumber, setGenderNumber] = useState(0); 
    const [gender, setGender] = useState('');
    const [genderInterest, setGenderInterest] = useState(''); 
    const [group, setGroup] = useState(0); 

    const [submitCollegeHidden, setSubmitCollegeHidden] = useState(true); 
    const [colleges, setColleges] = useState([]); 
    const [filteredColleges, setFilteredColleges] = useState([]); 
    const [hideCollegeResults, setHideCollegeResults] = useState(true); 
    const [collegeId, setCollegeId] = useState(null); 
    const [college, setCollege] = useState(''); 

    const [insertAuction] = useMutation(INSERT_AUCTION);
    const [insertAuctionedUser] = useMutation(INSERT_AUCTIONED_USER); 
    const [updateAuctionedUser] = useMutation(UPDATE_AUCTIONED_USER);

    const [auctionedUsers, setAuctionedUsers] = useState([]); 

    const [getColleges] = useLazyQuery(GET_COLLEGES, 
        { 
          onCompleted: (collegeData) => { processColleges(collegeData) } 
    }); 

    const [getAuctionedUsers] = useLazyQuery(GET_AUCTIONED_USERS, 
        {
            onCompleted: (auctionedUserData) => {            
                setAuctionedUsers(auctionedUserData.auctionedUsers); 
        }
    }); 

    useEffect(() => {
        getColleges(); 
    }, []);

    useEffect(() => {
        getAuctionedUsers({variables: { userId }}); 
    }, [userId]); 

    function processColleges(collegeData){
        setColleges(collegeData.colleges); 
        setFilteredColleges(collegeData.colleges);
    }


    function submitName(){
        setOnboardingStage('Gender'); 
    }

    function submitGenderMan(){
        setGenderNumber(1); 
        setGender('Man'); 
        setOnboardingStage('GenderInterest');
    }

    function submitGenderWoman(){
        setGenderNumber(2); 
        setGender('Woman'); 
        setOnboardingStage('GenderInterest');   
    }

    function submitGenderMore(){
        setOnboardingStage('GenderMore'); 
    }
    
    function submitInterestMan(){
        if(genderNumber == 1){
            // identifies as man and interested in men
            setGenderInterest('Men'); 
            setGroup(4);
        } else if(genderNumber == 2) {
            // identifies as woman and interested in men
            setGenderInterest('Men'); 
            setGroup(2); 
        }
        setOnboardingStage('College'); 
    }

    function submitInterestWoman(){
        if(genderNumber == 1){
            // identifies as man and interested in women
            setGenderInterest('Women'); 
            setGroup(1); 
        } else if(genderNumber == 2){
            // identifies as woman and interested in women
            setGenderInterest('Women'); 
            setGroup(5);
        }
        setOnboardingStage('College'); 
    }

    function submitInterestEveryone(){
        if(genderNumber == 1){
            // identifies as man and interested in everyone
            setGenderInterest('Everyone'); 
            setGroup(3); 
        } else if(genderNumber == 2){
            // identifies as woman and interested in everyone
            setGenderInterest('Everyone'); 
            setGroup(6);
        }
        setOnboardingStage('College'); 
    }

    function submitInstagram(){
        setOnboardingStage('Location');
    }

    function skipLocation(){
        setOnboardingStage('Completed'); 
        insert('', '');         
    }

    function submitLocation(data){
        const terms = data.terms;
        const city = terms[0].value;
        const state = terms[1].value; 
        insert(city, state);         
        setOnboardingStage('Completed'); 
    }

    async function insert(city, state){
        const data = await insertAuctionedUser({ variables: {college, collegeId, group, instagram, firstName: name, gender, genderInterest, city, region: state}})
        const auctionedId = data.data.insert_users_one.id; 
        setAuctionedId(auctionedId);
        insertAuction({ variables: { auctioneerId: userId, auctionedId }});
    }

    function handleSelectItem(item){
        setCollege(item.name); 
        setCollegeId(item.id); 
        setHideCollegeResults(true); 
        setOnboardingStage('Instagram'); 
    }

    function handleChangeText(item){
        setCollege(item); 
        setHideCollegeResults(false);
        const filteredColleges = colleges.filter(college => {
            return college.name.toLowerCase().match( item.toLowerCase() ) || college.nickname.toLowerCase().match( item.toLowerCase() );
        });
        setFilteredColleges(filteredColleges); 
    }

    function ExistingFriends(){

        function Item({auctionedUser}){

            const auctionedId = auctionedUser.id; 
            const name = auctionedUser.firstName; 
            const instagram = auctionedUser.instagram; 
            const college = auctionedUser.college; 

            function selectFriend(){
                setName(name);
                setAuctionedId(auctionedId); 
                setOnboardingStage('Completed'); 
            }
            
            return (
                <TouchableOpacity onPress={selectFriend} style={{width: 300, paddingTop: '7%', backgroundColor: '#000', height: 80 }}>
                    <Text style={{ color: '#eee', fontSize: 14  }}>{name}</Text>
                    <Text style={{ color: '#eee', fontSize: 14  }}>{college}</Text>
                    <Text style={{ color: '#eee', fontSize: 14, fontWeight: '500'  }}>{instagram}</Text>
                </TouchableOpacity>
            )
        }

        function editFriend(item){
            const name = item.auctionedUsers_users.firstName;
            const college = item.auctionedUsers_users.college;
            const instagram = item.auctionedUsers_users.instagram;

            setName(name);
            setCollege(college);
            setInstagram(instagram);
            setOnboardingStage('Name'); 
        }

        function deleteFriend(item){
            const auctionedId = item.auctionedUsers_users.id; 
            updateAuctionedUser({ variables: { auctionedId: auctionedId, auctioneerId: userId }});
            setAuctionedUsers(auctionedUsers.filter(auctionedUser => { return auctionedUser.auctionedUsers_users.id != auctionedId }));            
        };

        return (
            <SwipeListView
                data={auctionedUsers}
                renderItem={({ item, index }) => <Item auctionedUser={item.auctionedUsers_users} />}
                keyExtractor={item => item.auctionedUsers_users.id.toString()}
                style={{ paddingTop: '5%' }}
                renderHiddenItem={({ item, index })  => (
                    <View style={{ 
                        flexDirection: 'row',
                        justifyContent: 'flex-end', 
                        paddingTop: '7%',
                        alignItems: 'center', 
                        height: 80
                    }}>
                        <TouchableOpacity onPress={() => { editFriend(item) }}>
                            <AntDesign name='edit' size={35} color={colors.primaryWhite} />  
                        </TouchableOpacity>
                        <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { deleteFriend(item) }}>
                            <AntDesign name='delete' size={35} color={colors.primaryWhite} />  
                        </TouchableOpacity>
                    </View>
                )}
                rightOpenValue={-90}
            />
        )
    }

    function NewFriend(){
        return (
            <TouchableOpacity onPress={addNewFriend} style={{ padding: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.primaryPurple }}>
                <Text style={{ color: colors.primaryPurple, fontSize: 20 }}>Add New Friend</Text>
            </TouchableOpacity>
        )
    }

    function addNewFriend(){
        setOnboardingStage('Name');
        Segment.track("Auction - Add New Friend"); 
    }

    function SkipButton(){
        return (
            <TouchableOpacity onPress={() => { setOnboardingStage('Instagram') }}>
                <Text style={{ paddingTop: '3%', color: colors.primaryWhite}}>Skip</Text>
            </TouchableOpacity>
        )
    }

    function SkipLocationButton(){
        return (
            <TouchableOpacity onPress={skipLocation}>
                <Text style={{ paddingTop: '3%', color: colors.primaryWhite}}>Skip</Text>
            </TouchableOpacity>
        )
    }

    function goBack(){
        if(onboardingStage == 'Name'){
            setOnboardingStage('Home'); 
        } else if(onboardingStage == 'Gender' || onboardingStage == 'GenderMore'){
            setOnboardingStage('Name'); 
        } else if(onboardingStage == 'GenderInterest'){
            setOnboardingStage('Gender'); 
        } else if(onboardingStage == 'College'){
            setOnboardingStage('GenderInterest'); 
        } else if(onboardingStage == 'Instagram'){
            setOnboardingStage('College');
        } else if(onboardingStage == 'Location'){
            setOnboardingStage('Instagram');
        } else {
            console.log("going back in", onboardingStage); 
        }
    }

    if(onboardingStage == 'Home'){
        return(
            <View style={{...styles.permissionsViewBackground, paddingTop: '50%'}}>
                <Text style={styles.permissionsTitle}>Auction a Friend</Text>
                <Text style={styles.permissionsSubtitle}>Get your friend to answer a question.</Text>
                <Text style={styles.permissionsSubtitle}>Interested users will DM them on Instagram.</Text>
                <View style={{ paddingTop: 30}}>
                   <NewFriend />
                </View>
                <ExistingFriends />
            </View>

        )
    } else if(onboardingStage == 'Name') {
        return (
            <View style={styles.permissionsViewBackground}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                        <TouchableOpacity onPress={goBack} style={{ ...StyleSheet.absoluteFill, paddingTop: '10%', paddingLeft: '5%' }}>
                            <Ionicons name="ios-arrow-back" size={45} color={colors.primaryWhite} />
                        </TouchableOpacity>
                        <View style={{ padding: 15, borderRadius: 10, borderWidth: 1, borderColor: colors.primaryPurple, justifyContent: 'center', alignItems: 'center'}}>
                            <Ionicons name="md-person" size={45} color={colors.primaryWhite} />
                            <Text style={{ fontSize: 19, fontWeight: 'bold', padding: 15, color: colors.primaryWhite }}>What's your friend's name?</Text>
                            <TextInput 
                                style={{ 
                                    textAlign: 'center', 
                                    fontSize: 18, 
                                    padding: 15, 
                                    color: colors.primaryWhite,  
                                    borderColor: colors.primaryWhite,
                                    borderWidth: 1,
                                    width: 200,
                                    borderRadius: 5
                                    }}
                                onFocus={() => setName('')}
                                onChangeText={text => setName(text)}
                                value={name}
                            />
                            <View style={{ paddingTop: '3%' }}>
                                <TouchableOpacity onPress={submitName} style={styles.container}>
                                    <Text style={styles.text}>Submit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        )
    } else if(onboardingStage == 'Gender'){
        return (
            <View style={styles.permissionsViewBackground}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                        <TouchableOpacity onPress={goBack} style={{ ...StyleSheet.absoluteFill, paddingTop: '10%', paddingLeft: '5%' }}>
                            <Ionicons name="ios-arrow-back" size={45} color={colors.primaryWhite} />
                        </TouchableOpacity>
                        <View style={{ padding: 15, borderRadius: 10, borderWidth: 1, borderColor: colors.primaryPurple, justifyContent: 'center', alignItems: 'center'}}>
                            <Ionicons name="md-person" size={45} color={colors.primaryWhite} />
                            <Text style={{ fontSize: 19, fontWeight: 'bold', padding: 15, color: colors.primaryWhite }}>What's your friend's gender?</Text>
                            <View style={{ justifyContent: 'space-around'}}>
                                <TouchableOpacity onPress={submitGenderWoman} style={styles.container}>
                                    <Text style={styles.text}>Woman</Text>
                                </TouchableOpacity>
                                <View style={{ paddingTop: 5 }}>
                                    <TouchableOpacity onPress={submitGenderMan} style={styles.container}>
                                        <Text style={styles.text}>Man</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ paddingTop: 5 }}>
                                    <TouchableOpacity onPress={submitGenderMore} style={styles.container}>
                                        <Text style={styles.text}>More</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        )
    } else if(onboardingStage == 'GenderMore'){
        return(
            <View style={styles.permissionsViewBackground}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                        <TouchableOpacity onPress={goBack} style={{ ...StyleSheet.absoluteFill, paddingTop: '10%', paddingLeft: '5%' }}>
                            <Ionicons name="ios-arrow-back" size={45} color={colors.primaryWhite} />
                        </TouchableOpacity>
                        <View style={{ padding: 15, borderRadius: 10, borderWidth: 1, borderColor: colors.primaryPurple, justifyContent: 'center', alignItems: 'center'}}>
                            <Ionicons name="md-person" size={45} color={colors.primaryWhite} />
                            <Text style={{ fontSize: 19, fontWeight: 'bold', padding: 15, color: colors.primaryWhite }}>Show your friend to people looking for</Text>
                            <View style={{ justifyContent: 'space-around'}}>
                                <TouchableOpacity onPress={submitGenderWoman} style={styles.container}>
                                    <Text style={styles.text}>Women</Text>
                                </TouchableOpacity>
                                <View style={{ paddingTop: 5 }}>
                                    <TouchableOpacity onPress={submitGenderMan} style={styles.container}>
                                        <Text style={styles.text}>Men</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        )
    } else if(onboardingStage == 'GenderInterest'){
        return (
            <View style={styles.permissionsViewBackground}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                        <TouchableOpacity onPress={goBack} style={{ ...StyleSheet.absoluteFill, paddingTop: '10%', paddingLeft: '5%' }}>
                            <Ionicons name="ios-arrow-back" size={45} color={colors.primaryWhite} />
                        </TouchableOpacity>
                        <View style={{ padding: 15, borderRadius: 10, borderWidth: 1, borderColor: colors.primaryPurple, justifyContent: 'center', alignItems: 'center'}}>
                            <Ionicons name="md-person" size={45} color={colors.primaryWhite} />
                            <Text style={{ fontSize: 19, fontWeight: 'bold', padding: 15, color: colors.primaryWhite }}>Your friend is looking to date</Text>
                            <View style={{ justifyContent: 'space-around'}}>
                                <TouchableOpacity onPress={submitInterestWoman} style={styles.container}>
                                    <Text style={styles.text}>Women</Text>
                                </TouchableOpacity>
                                <View style={{ paddingTop: 5 }}>
                                    <TouchableOpacity onPress={submitInterestMan} style={styles.container}>
                                        <Text style={styles.text}>Men</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ paddingTop: 5 }}>
                                    <TouchableOpacity onPress={submitInterestEveryone} style={styles.container}>
                                        <Text style={styles.text}>Everyone</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        );
    } else if(onboardingStage == 'College') {
        return (
            <View style={styles.permissionsViewBackground}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                        <TouchableOpacity onPress={goBack} style={{ ...StyleSheet.absoluteFill, paddingTop: '10%', paddingLeft: '5%' }}>
                            <Ionicons name="ios-arrow-back" size={45} color={colors.primaryWhite} />
                        </TouchableOpacity>
                        <View style={{ padding: 15, borderRadius: 10, borderWidth: 1, borderColor: colors.primaryPurple, justifyContent: 'center', alignItems: 'center'}}>
                            <Ionicons name="md-person" size={45} color={colors.primaryWhite} />
                            <Text style={{ fontSize: 19, fontWeight: 'bold', padding: 15, color: colors.primaryWhite }}>Choose a college</Text>
                            <View style={{ 
                                width: 250, 
                                height: '15%',
                                alignItems: 'center', 
                            }}>
                                <Autocomplete
                                    data={filteredColleges}
                                    defaultValue={college}
                                    onChangeText={item => handleChangeText(item)}
                                    hideResults={hideCollegeResults}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity 
                                            onPress={() => handleSelectItem(item)}
                                            style={{ height: 40, justifyContent: 'center'}}
                                        >
                                            <Text style={{ color: colors.primaryPurple, fontSize: 14}}>{item.name} ({item.nickname})</Text>
                                        </TouchableOpacity>
                                    )}
                                    containerStyle={{ width: '100%'}}
                                    keyExtractor={(item) => item.id.toString()}
                                />
                            </View>
                        </View>
                        <SkipButton />
                    </View>
                </TouchableWithoutFeedback>
            </View>
        );
    } else if(onboardingStage == 'Instagram') {
        return (
            <View style={styles.permissionsViewBackground}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                        <TouchableOpacity onPress={goBack} style={{ ...StyleSheet.absoluteFill, paddingTop: '10%', paddingLeft: '5%' }}>
                            <Ionicons name="ios-arrow-back" size={45} color={colors.primaryWhite} />
                        </TouchableOpacity>
                        <View style={{ padding: 15, borderRadius: 10, borderWidth: 1, borderColor: colors.primaryPurple, justifyContent: 'center', alignItems: 'center'}}>
                            <Feather name="instagram" size={45} color={colors.primaryWhite} />
                            <Text style={{ fontSize: 19, fontWeight: 'bold', padding: 15, color: colors.primaryWhite }}>What's their Instagram?</Text>
                            <TextInput 
                                style={{ 
                                    textAlign: 'center', 
                                    fontSize: 18, 
                                    padding: 15, 
                                    color: colors.primaryWhite,  
                                    borderColor: colors.primaryWhite,
                                    borderWidth: 1,
                                    width: 200,
                                    borderRadius: 5
                                    }}
                                onFocus={() => setInstagram('@')}
                                onChangeText={text => setInstagram(text)}
                                value={instagram}
                            />
                            <View style={{ paddingTop: '3%' }}>
                                <TouchableOpacity onPress={submitInstagram} style={styles.container}>
                                    <Text style={styles.text}>Submit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        )
    } else if(onboardingStage == 'Location') {
        return (
            <View style={styles.permissionsViewBackground}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                        <TouchableOpacity onPress={goBack} style={{ ...StyleSheet.absoluteFill, paddingTop: '10%', paddingLeft: '5%' }}>
                            <Ionicons name="ios-arrow-back" size={45} color={colors.primaryWhite} />
                        </TouchableOpacity>
                        <View style={{ height: '30%', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: colors.primaryPurple, justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={{ fontSize: 19, fontWeight: 'bold', padding: 15, color: colors.primaryWhite }}>Choose a city</Text>
                            <GooglePlacesAutocomplete
                                placeholder='Search'
                                onPress={(data, details = null) => {
                                    submitLocation(data); 
                                    // 'details' is provided when fetchDetails = true
                                }}
                                query={{
                                    key: 'AIzaSyCaXNTEyRQIS9NJfV56PvPXU7rvm82OVFk',
                                    language: 'en',
                                    types: '(cities)'
                                }}
                                enablePoweredByContainer={false}
                                styles={{
                                    container: {
                                        width: 275
                                    },
                                    textInputContainer: {
                                        backgroundColor: 'rgba(0,0,0,0)',
                                        borderTopWidth: 0,
                                        borderBottomWidth: 0,
                                    },
                                    description: {
                                        color: '#eee'
                                    }
                                }}
                            />                            
                        </View>
                        <SkipLocationButton />
                    </View>
                </TouchableWithoutFeedback>
            </View>
        )
    } else {
        return (
            <AuctionContents 
                route={props.route}
                navigation={props.navigation}
                data={props.data}
                firstVideo={props.firstVideo}
                auctionedId={auctionedId}
                name={name}
                setOnboardingStage={setOnboardingStage}
            />
        )    
    }
}

const styles = StyleSheet.create({
    permissionsViewBackground: { height: '100%', backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    permissionsTitle: { color: '#eee', fontSize: 22, fontWeight: 'bold', paddingBottom: 20 },
    permissionsSubtitle: { color: '#eee', fontSize: 16, paddingBottom: 3 },
    optionContainer: { 
        backgroundColor: colors.primaryPurple, 
        borderRadius: 5,
        width: 100,
        height: 50, 
        justifyContent: 'center', 
        alignItems: 'center'
    }, 
    container: { 
        backgroundColor: colors.primaryPurple, 
        borderRadius: 5,
        width: 250,
        height: 50, 
        justifyContent: 'center', 
        alignItems: 'center'
    }, 
    text: {
        fontSize: 17,
        color: colors.primaryWhite,
        fontWeight: 'bold'
    },
    rowFront: {
        alignItems: 'center',
        backgroundColor: '#CCC',
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        justifyContent: 'center',
        height: 50,
    },
    rowBack: {
        alignItems: 'center',
        backgroundColor: 'red',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15,
    },
});