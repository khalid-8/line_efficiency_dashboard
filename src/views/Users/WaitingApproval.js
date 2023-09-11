import React from 'react'
import { Button } from 'react-bootstrap'
import { GiSandsOfTime } from 'react-icons/gi'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context'

export default function WaitingApproval() {
  const {logOut} = useAuthContext()

  const navigate = useNavigate()

  return (
    <div className='d-flex flex-column align-items-center justify-content-center' 
    style={{height: "80vh"}}>
        <GiSandsOfTime style={{fontSize: "9em", margin: "20px"}}/>
        <h1 className='text-center'>please wait for the admin to aprove your account</h1>
        <Button variant='link' style={{fontSize: "1.3em", textDecoration: "none", fontWeight: "900"}}
        onClick={async() => {
          await logOut()
          navigate('/')
        }}
        >
        go to dashboard
        </Button>
    </div>
  )
}
