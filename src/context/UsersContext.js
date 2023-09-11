import { collection, getFirestore, onSnapshot } from 'firebase/firestore'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { Notify } from '../components'
import { API } from '../helpers'
import { useAuthContext } from './AuthContext'

const usersContext = createContext()

export function useUsersContext() {
    return useContext(usersContext)
}

export function UsersProvider({children}) {
    const [listUser, setListUsers] = useState()

    const { currentUser } = useAuthContext()

    const addUser = (user) => {
        setListUsers((prev) => [...prev, user])
    }

    const removeUser = (uid) => {
        setListUsers(listUser.filter(user => user.uid !== uid))
    }

    useEffect(() => {
        if(!currentUser || !currentUser?.claim?.admin) return
        const getUsers = async() => {
            API.getAllUsers().then((list) => {
                setListUsers(list)
                return list
            })
            // if(list){
            //     setListUsers(list)
            //     return list
            // }
        }
        
        const db = getFirestore()
        //if user is admin get all events from the DB
        const unsubscribe = onSnapshot(collection(db, "newUsers"), async(querySnapshot) => {
            getUsers().then((approved) => {
                if(querySnapshot.empty) return
    
                querySnapshot.forEach((doc) => {
                    const newUser = doc.data()
                    const found = approved?.some(item => item.uid === newUser.uid);
                    if(!found) addUser(doc.data())
                });
                // HeaderNotify(true)
            })

        }, (err) => {
            console.error(err)
            Notify("please check your Internet connection", true)
        });

        return unsubscribe
    }, [currentUser, currentUser?.claim?.admin])
    

    // useEffect(() => {
    //     API.getAllUsers().then((list) => {
    //         setListUsers(list)
    //         console.log(list)
    //         return list
    //     }).catch((err) => {
    //         console.log(err)
    //     })
    // }, [])

    const value = {
        listUser,
        addUser,
        removeUser
    }

    return (
        <usersContext.Provider value={value}>
            {children}
        </usersContext.Provider>
    )
}
