import { 
    createUserWithEmailAndPassword, 
    deleteUser, 
    EmailAuthProvider, 
    getIdToken, 
    onAuthStateChanged, 
    reauthenticateWithCredential, 
    sendPasswordResetEmail, 
    signInWithEmailAndPassword, 
    signOut, 
    updateEmail, 
    updatePassword, 
    updateProfile
} from 'firebase/auth';
import React, {createContext, useState, useContext, useEffect} from 'react'
import { auth } from '../helpers';
import { Notify, LoadingSpinner } from '../components';

export const authContext = createContext();

export function useAuthContext(){
    return useContext(authContext)
}

export function AuthProvider({children}) {
    const [currentUser, setCurrentUser] = useState() 
    const [loading, setLoading] = useState(true)
    // const [canAccess, setCanAccess] = useState(false)

    const signUp = async (email, password) =>{
        const newUser = await createUserWithEmailAndPassword(auth, email, password)
        .then(async(data) => {
            try{
                await updateUserProfile({user: data.user, url: "https://firebasestorage.googleapis.com/v0/b/e-invitation-development.appspot.com/o/placeholder.jpeg?alt=media&token=df919fa1-7b13-4052-ac88-444df801dd58"})
                // const dateNow = new Date().toLocaleString("en-US", {timeZone: "Asia/Riyadh"})
                // const {displayName, email, photoURL, uid} = data.user
                // API.uploadDoc("newUsers", data.user.uid, {
                //     displayName: displayName,
                //     email: email,
                //     photoURL: photoURL,
                //     uid: uid,
                //     create_at: dateNow
                // })
                return data.user
            }catch(err){
                console.log(err.code)
            }
        }).catch((err) => {
            if(err.code === "auth/email-already-in-use"){
                return Notify("email already in use", true)
            }
            Notify("Couldn't create account, please try again later", true)
        })
        if(newUser) return newUser
    }

    const logIn = async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password)
        .catch((err) => {
            console.log(err)
            if(err.code === "auth/user-not-found"){
                Notify("No Account with this eamil", true)
            }
            if(err.code === "auth/wrong-password"){ 
                Notify("Password isn't correct", true)
            }
            if(err.code === "auth/too-many-requests"){
                Notify("Your account has been suspended due to many wrong sign in requests", true, true)
            }
            if(err.code === "auth/network-request-failed"){
                Notify("Please check your network connection", true)
            }
            else Notify("Please try again later", true)
            throw new Error("try again later")
        })
    }

    const logOut = async () => {
        await signOut(auth)
        setCurrentUser(undefined)
        localStorage.clear();
        sessionStorage.clear();
    }

    const updateUserProfile = async({user=null, name = null, url = null}) =>{
        const userToUpdate = user? user : currentUser.user
        if (userToUpdate){
            try{
                await updateProfile(userToUpdate, {
                    displayName: name? name : null, photoURL: url? url : null
                })
            }catch(err){
                console.error(err) 
            }
        }
    }

    const updateMyEmail = (email) => {
        updateEmail(currentUser.user, email)
    }

    const updateMyPass = (password) => {
        updatePassword(currentUser.user, password)
    }

    const forgotPassword = async (email) => {
        await sendPasswordResetEmail(auth, email)
    }

    const deleteAccount = async(pass) => {
        if(currentUser){
            const cred = EmailAuthProvider.credential(currentUser.user.email, pass)
            reauthenticateWithCredential(currentUser.user, cred)

            deleteUser(currentUser.user).then(async() => {
                await logOut()
            }).catch((err) => {
                console.error(`Couldn't delete the user: ${err}`)
                Notify("Couldn't delete the user, make sure the password is correct", true)
            })
        }
    }

    const updateCurrentUser = async (user, claim) =>{
        setCurrentUser({user, claim})
        if (!claim?.admin) return
        getIdToken(user, true).then((authToken) => {
            sessionStorage.setItem("authToken", authToken)
        }).catch((err) => {
            Notify("لم نستطع الحصول على توكن" , true, true)
        })
    }

    useEffect(()=>{
        setLoading(true)
        const unSubscribe = onAuthStateChanged(auth, async (user) => {
            const tokenRes = await user?.getIdTokenResult()

            console.log(tokenRes)
            const claim = tokenRes?.claims
            claim ? updateCurrentUser(user, claim) : setCurrentUser(user)

            if(claim && claim?.approved !== true){
                Notify("Please wait for the admin to aprove your account", true, true)
                await logOut()
            }
            setLoading(false)
        })
        return unSubscribe
    },[]) 
    
    const value = {
        currentUser, 
        updateUserProfile,
        signUp,
        logIn,
        logOut,
        updateMyEmail,
        updateMyPass,
        forgotPassword,
        deleteAccount,
        // canAccess
    }

    return (
        <authContext.Provider value={value}>
            
            {loading?
                <LoadingSpinner show={loading} waitingToLoad={true}/>
                : 
                children
            }
        </authContext.Provider>
    )
}

/*<div className='mainLoadingBG'>
<Spinner animation="border" variant="dark" style={{fontSize: "3em", width:"3em", height:"3em"}}/> 
</div>*/