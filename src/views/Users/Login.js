import React, { useState, useRef} from "react";
import { Alert, Card, Container, Button, Form} from "react-bootstrap"; //Spinner
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context";


export default function Login() {
    const [errorMsg, setErrorMsg] = useState()
    const [isLoading, setIsLoading] = useState(false)

    const emailRef = useRef()
    const passRef = useRef()

    const { logIn } = useAuthContext()

    let navigate = useNavigate();

    const routeChange = () =>{ 
        let path = `/`; 
        navigate(path)
    }

    const handleSubmit = async (e) =>{
        e.preventDefault()

        try{
            setIsLoading(true)
            setErrorMsg('')
            await logIn(emailRef.current.value, passRef.current.value)
            routeChange()
        }catch (err){
            setErrorMsg("Wrong Email or Password")
            console.log(err)
        }
        setIsLoading(false)
    }

    const validateEmail = (email) => {
        const re = /^\S+@\S+\.\S+$/;

        return re.test(email);
    }

    return (
        <>
            {isLoading && 

                <div className='blurBG'> 
                    <div className="loader"></div>
                </div>
            }
            <Container className="d-flex flex-column align-items-center justify-content-center"
            style={{minHeight: "100vh"}}>
                <div className="w-100" style={{maxWidth: "500px" }}>
                    <Card>
                        <Card.Body>
                            <h2 className="text-center mb-4 font-weight-600">Loggin In</h2>
                            {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group id="email" className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control type="email" 
                                    ref={emailRef} required
                                    onBlur={(e) => {
                                        if(validateEmail(e.target.value)) e.target.classList.remove("is-invalid") 
                                        else e.target.classList.add("is-invalid")
                                    }}/>
                                </Form.Group>
                                <Form.Group id="password" className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" 
                                    ref={passRef} required
                                    onChange={(e) => {
                                        if (e.target.value.length < 6) e.target.classList.add("is-invalid") 
                                        else e.target.classList.remove("is-invalid")
                                    }}/>
                                    <div className="mt-1">
                                        <p className="mb-0" style={{fontSize: "12px",fontWeight: "100"}}>*Password must consist of at least 6 characters</p>
                                    </div>
                                </Form.Group>
                                <Button className="w-100 mt-4 custom-btn" type="submit" disabled={isLoading}>Log In</Button>
                                <p className="mt-4 mb-0 text-center" 
                                  style={{fontSize: "14px",fontWeight: "100"}}>
                                    <Link to="/forgotPassword" style={{textDecoration: "none", color: "red"}}>Forgot Password?</Link>
                                </p>
                            </Form>
                        </Card.Body>
                    </Card>
                    <div className="w-100 text-center mt-2">You don't have an account? <Link to='/signup' style={{textDecoration: "none", color: "#5600E8"}}>Sign up</Link></div>
                </div>
            </Container>
        </>
    )
}
