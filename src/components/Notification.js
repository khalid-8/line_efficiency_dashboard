import React, { useState, useEffect } from 'react'
import {Alert} from "react-bootstrap";


let OpenNotificationFunction;

/***
 *  Notification is a component which needs to be places in Global App.js or alongside the Routes
 *  notify() is a helper function to trigger Notification Component
 ***/
export const Notify = (msg, warning, permanent, title=null) =>{
    OpenNotificationFunction(msg, warning, false, title)
}

export default function Notification() {
    const [title, setTitle] = useState(null)
    const [msg, setMsg] = useState("")
    const [open, setOpen] = useState(false)
    const [isWarning, setIsWarning] = useState(true)


    const closeNotification = () =>{
        setOpen(false)
        setTitle(null)
        setMsg("")
    }

    useEffect(() => {
        const openNotification = (newMsg, warning, permanent, title) =>{
            if (title) setTitle(title)
            else setTitle(warning? "Something Went Wrong!": "Ok")
            setMsg(newMsg)
            setOpen(true)
            setIsWarning(warning)
            if(permanent !== true){
                setTimeout(()=>{
                    closeNotification()
                }, 7000)
            }
        }
        
        OpenNotificationFunction = openNotification;
    }, []);

    return (
        <>
        {open && 
            <Alert variant={isWarning? "danger" : "success"} onClose={() => setOpen(false)} dismissible
                style={{
                    position: "fixed", left: "50%", transform: "translate(-50%)",
                    top: "1em", minWidth: "250px", maxWidth: "400px", zIndex: "9999",
                    textTransform: "uppercase"
                }}>
                <Alert.Heading>{title}</Alert.Heading>
                <p>
                    {msg}
                </p>
            </Alert>
        }
        </>
    )
}