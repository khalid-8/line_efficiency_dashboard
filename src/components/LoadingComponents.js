import React from 'react'
import { Card, Spinner } from 'react-bootstrap'
import "./styles/loadingComponents.css"

export default function LoadingCards(i) {
    const loadingCard = (i) =>{
        return(
            <Card style={{width: "9em", marginTop: "1em"}} key={i}>
                <Card.Body className='d-flex flex-column justify-content-center align-items-center p-2'>
                    <div className='loading-card-img'/>
                    <div className="loading-card-role"/>
                    <div className="loading-card-name"/>
                </Card.Body>
            </Card>
        )
    }

    return (
        <>
            {
                [...Array(3)].map((x, i) =>(loadingCard(i)))
                
            }
            
        </>
    )
}

export function LoadingSpinner({ msg, show, waitingToLoad}){
    //
    return(
        <>
        {show &&
            <>
            {waitingToLoad? 
                <div className='loader-bg'> 
                    <Spinner animation="border" variant="light" loading="false" className="spinner-loader"/> 
                </div>
                :
                <div className='blurBG'> 
                    <Spinner animation="border" variant="light" className="spinner-loader"/> 
                    <b className='loader_text'>{msg}</b>
                </div>
            }
            </>
        }
        </>
    )
}