import React, { createContext, useContext, useRef, useState } from "react";
import { Alert, Button } from "react-bootstrap";
import "./sytles/confirmation.css"

const ConfirmationContext = createContext({});

export const useConfirmationContext = () => {
    return useContext(ConfirmationContext)
};

export function ConfirmationProvider({children}){
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationMsg, setConfirmationMsg] = useState()
    
    const resolver = useRef();

    const showConfirmationAlert = (msg) => {
        setConfirmationMsg(msg)
        setShowConfirmation(true);
        document.body.style = "overflow-y: hidden !important;"
        return new Promise(function (resolve) {
        resolver.current = resolve;
        });
    };

    const handleOk = () => {
        document.body.style.removeProperty('overflow-y')
        resolver.current && resolver.current(true);
        setShowConfirmation(false)
    };

    const handleCancel = () => {
        document.body.style.removeProperty('overflow-y')
        resolver.current && resolver.current(false);
        setShowConfirmation(false)
    };

    const value = {
        showConfirmationAlert
    }
    return (
        <ConfirmationContext.Provider value={value}>
            {children}

            {showConfirmation &&
                <div className='blurBG'> 
                    <Alert className="w-80 confirmation" variant="danger" show={showConfirmation}>
                        <Alert.Heading>{confirmationMsg.head}</Alert.Heading>
                        <strong>
                            {confirmationMsg.body}
                        </strong>
                        
                        <div className="btns-div">
                            <Button className="conf-btn" onClick={handleCancel} variant="outline-primary">
                                Cancel
                            </Button>
                            <Button className="conf-btn" variant="outline-danger"
                            onClick={handleOk}>
                                Yes
                            </Button>
                        </div>
                    </Alert>
                </div> 
        }

        </ConfirmationContext.Provider>
    )
};