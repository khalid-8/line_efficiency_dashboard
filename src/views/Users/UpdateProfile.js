import React, { useState, useRef} from "react";
import { Alert, Card, Container, Button, Form} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context";
import { Notify } from "../../components";

export default function UpdateProfile() {
    const [errorMsg, setErrorMsg] = useState()
    const [isLoading, setIsLoading] = useState(false)

    const nameRef = useRef()
    const emailRef = useRef()
    const passRef = useRef()
    const confirmPassRef = useRef()

    const { currentUser, updateUserProfile, updateMyEmail, updateMyPass } = useAuthContext()

    let navigate = useNavigate(); 


    const handleSubmit = async(e) =>{
        e.preventDefault()

        if (passRef.current.value !== confirmPassRef.current.value){
            return setErrorMsg("Passwords don't match")
        }

        const promises = []

        setIsLoading(true)
        setErrorMsg('')

        if (nameRef.current.value !== currentUser.user.displayName){
            promises.push(updateUserProfile({name: nameRef.current.value}))
        }

        if (emailRef.current.value !== currentUser.user.email){
            promises.push(updateMyEmail(emailRef.current.value))
        }

        if (passRef.current.value){
            promises.push(updateMyPass(passRef.current.value))
        }

        await Promise.all(promises).then(() => {
            Notify("account information has been updated", false)
            navigate("/dashboard")
        }).catch((err) => {
            setErrorMsg("we couldn't update account information")
            console.error(err)
        }).finally(() => {
            setIsLoading(false)
        })

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
        <main>
            <Container className="d-flex align-items-center justify-content-center"
            style={{paddingTop: "0", marginTop: "0"}}>
                <div className="w-100" style={{maxWidth: "400px"}}>
                    <Card>
                        <Card.Body>
                            <h2 className="text-center mb-4 font-weight-bold">Update Account Info</h2>
                            {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group id="email" className="mb-3">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control type="text" 
                                        ref={nameRef}
                                        autoComplete={"off"}
                                        defaultValue={currentUser.user.displayName}/>
                                </Form.Group>
                                <Form.Group id="email" className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control type="email" 
                                    ref={emailRef}
                                    autoComplete={"off"}
                                    defaultValue={currentUser.user.email}
                                    onBlur={(e) => {
                                        if(validateEmail(e.target.value)) e.target.classList.remove("is-invalid") 
                                        else e.target.classList.add("is-invalid")
                                    }}/>
                                </Form.Group>
                                <Form.Group id="password" className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" 
                                    ref={passRef}
                                    autoComplete={"new-password"}
                                    placeholder="leave it empety if don't want to update your password"
                                    onChange={(e) => {
                                        if (e.target.value.length < 6) e.target.classList.add("is-invalid") 
                                        else e.target.classList.remove("is-invalid")
                                    }}/>
                                    <div className="mt-1">
                                        <p className="mb-0" style={{fontSize: "12px",fontWeight: "100"}}>*Password must consist of at least 6 characters</p>
                                    </div>
                                </Form.Group>
                                <Form.Group id="passwordConfirmation" className="mb-3">
                                    <Form.Label>Confirm New Password</Form.Label>
                                    <Form.Control type="password" ref={confirmPassRef}
                                    autoComplete={"new-password"}
                                    placeholder="leave it empety if don't want to update your password"
                                    onChange={handlePassInput}/>
                                    <div className="mt-1">
                                        <p style={{fontSize: "12px",fontWeight: "100"}}>*Password must consist of at least 6 characters</p>
                                    </div>
                                </Form.Group>
                                <Button className="w-100 mt-4 custom-btn" type="submit" disabled={isLoading}>Update</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                    <div className="w-100 text-center mt-2"><Link to='/dashBoard' style={{textAlign: "Center", textDecoration: "none", color: "red"}}>Cancel</Link></div>
                </div>
            </Container>
        </main>
    )
}