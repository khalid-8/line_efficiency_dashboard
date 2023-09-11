import { collectionGroup, onSnapshot, orderBy, query, doc } from 'firebase/firestore'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { db } from '../helpers'

const tableContext = createContext()

export function useTableContext() {
    return useContext(tableContext)
}

export function TablesProvider({children}) {
    const [data, setData] = useState()
    const [shiftStart, setShiftStart] = useState(7)
    const [breaks, setBreaks] = useState(['12', '20'])

    useEffect(() => {
        //if user is admin get all events from the DB
        const q = query(collectionGroup(db, "production"), orderBy('timestamp', 'desc'))
        
        const unsubscribe = onSnapshot(q, async(querySnapshot) => {
            // const start = Date.now();
            const dataMap = new Map()

            querySnapshot.forEach((doc) => {
                const line = doc.ref.parent.parent.id
                // const date = doc.ref.id

                if(!dataMap.has(line)) dataMap.set(line, []);
                dataMap.get(line).push({...doc.data()});
            });
            setData(dataMap)
            // const end = Date.now();
            // console.log(`Execution time: ${end - start} ms`);
        }, (err) => {
            console.error(err)
        });

        return unsubscribe
    }, [])

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "data", "shiftData"), (doc) => {
            if (!doc.exists()) return
            console.log(doc.data())
            doc.data()?.breaks && setBreaks(doc.data()?.breaks)
            setShiftStart(doc.data().startAt)
            }, (err) => {
                console.error(err)
            }
        );
                // HeaderNotify(true)
        

        return unsubscribe
    }, [])

    const value = {
        data,
        shiftStart, 
        breaks
    }

    return (
        <tableContext.Provider value={value}>
            {children}
        </tableContext.Provider>
    )
}
