import React, { useState, useRef} from "react";
import { Alert, Card, Container, Button, Form} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context";

//TODO Check if new user is valid before redirect to waiting page
export default function SignUp() {
    const [errorMsg, setErrorMsg] = useState()
    const [isLoading, setIsLoading] = useState(false)

    const emailRef = useRef()
    const passRef = useRef()
    const confirmPassRef = useRef()

    const { signUp } = useAuthContext()

    let navigate = useNavigate(); 

    const routeChange = () =>{ 
        let path = `/not_approved`; 
        navigate(path)
    }

    const handleSubmit = async (e) =>{
        e.preventDefault()

        if (passRef.current.value !== confirmPassRef.current.value){
            return setErrorMsg("Passwords don't match")
        }

        try{
            setIsLoading(true)
            setErrorMsg('')
            const user = await signUp(emailRef.current.value, passRef.current.value)
            if(user){
                routeChange()
            }
            
        }catch (err){
            setErrorMsg("Couldn't create new account")
            console.log(err)
        }
        setIsLoading(false)
    }

    const validateEmail = (email) => {
        const re = /^\S+@\S+\.\S+$/;

        return re.test(email);
    }

    const handlePassInput = (e) => {
        if (e.target.value.length < 6 || e.target.value !== passRef.current.value) e.target.classList.add("is-invalid") 
        else e.target.classList.remove("is-invalid")
    }

    return (
        <>
            <Container className="d-flex flex-column align-items-center justify-content-center"
            style={{minHeight: "100vh"}}>
                <div className="w-100" style={{minWidth: "500px"}}>
                    <Card>
                        <Card.Body>
                            <h2 className="text-center mb-4 font-weight-bold">Creating a new Account</h2>
                            {errorMsg && <Alert variant="danger" className="w-100">{errorMsg}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group id="email" className="mb-3">
                                    <Form.Label>ِEmail</Form.Label>
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
                                <Form.Group id="passwordConfirmation" className="mb-3">
                                    <Form.Label>Re-enter Password</Form.Label>
                                    <Form.Control type="password" ref={confirmPassRef} required
                                    onChange={handlePassInput}/>
                                    <div className="mt-1">
                                        <p style={{fontSize: "12px",fontWeight: "100"}}>*This field input should match the password's input</p>
                                    </div>
                                </Form.Group>
                                <Button className="w-100 mt-4 custom-btn" type="submit" disabled={isLoading}>Sign Up</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                    <div className="w-100 text-center mt-2">You already have an account? <Link to='/login' style={{textDecoration: "none", color: "#5600E8"}}>Login</Link></div>
                </div>
            </Container>
        </>
    )
}
