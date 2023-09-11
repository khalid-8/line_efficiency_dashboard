import React, {useState} from 'react'
import "../styles/dashBoard.css"
import { useAuthContext } from '../../context'
import { Alert, Card, Container, Button} from "react-bootstrap";
import { Link, useNavigate } from 'react-router-dom';

export default function DashBoard() {
    const [errorMsg, setErrorMsg] = useState()

    const {currentUser, logOut} = useAuthContext()

    const navigate = useNavigate()

    const handleLogOut = async() => {
        try{
            await logOut()
            navigate('/login')
        }catch{
            setErrorMsg("Coundn't sign out")
        }
    }

    return (
        <main className='user_dashboard'>
            <Container className="d-flex justify-content-center"
            style={{minHeight: "100%"}}>
                <div className="w-100" style={{maxWidth: "600px"}}>
                    <Card className='dash-card'>
                        <Card.Body>
                            <h2 className="text-center mb-4 font-weight-bold">Account Info</h2>
                            {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
                            <div className='profile-img'>
                                <div style={{position: "relative"}}>
                                    <img src={`${process.env.REACT_APP_HOSTING_SUBFOLDER}/imgs/profile-Image-placeHolder.jpeg`} alt="profile Avatar"/>            
                                </div>
                            </div>
                            <div className='text-center mb-2 d-flex flex-column'>
                                <strong>{currentUser.user.displayName}</strong>
                                <small style={{fontWeight: "100"}}>{currentUser?.claim?.admin ? "admin" : "user"}</small>
                                <small>{currentUser.user.email}</small>
                            </div>

                            <Link to="/update_profile" className='btn custom-btn w-100 mt-3'>
                                Update Account Info
                            </Link>
                        </Card.Body>
                    </Card>
                    <div className='w-100 text-center mt-2'>
                        <Button variant='link' onClick={() => handleLogOut()}
                        style={{textAlign: "Center", textDecoration: "none", color: "red"}}>
                            Logout
                        </Button>
                    </div>
                    
                </div>
            </Container>
        </main>
    )
}

// {showLoader && <LoadingImg/>}