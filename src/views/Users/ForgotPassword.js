import React, { useState, useRef} from "react";
import { Alert, Card, Container, Button, Form} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineRight } from "react-icons/ai";
import { useAuthContext } from "../../context";
import { Notify } from "../../components";


export default function ForgotPassword() {
    const [errorMsg, setErrorMsg] = useState()
    const [isLoading, setIsLoading] = useState(false)

    const emailRef = useRef()

    const { forgotPassword } = useAuthContext()

    let navigate = useNavigate();

    const routeChange = () =>{ 
        let path = `/login`; 
        navigate(path)
    }

    const handleSubmit = async (e) =>{
        e.preventDefault()

        try{
            setIsLoading(true)
            setErrorMsg('')
            await forgotPassword(emailRef.current.value)
            Notify(`an Email has been sent to ${emailRef.current.value}`, false)
            routeChange()
        }catch (err){
            setErrorMsg("There's no account with this email")
            console.log(err)
        }
        setIsLoading(false)
    }

    const validateEmail = (email) => {
        const re = /^\S+@\S+\.\S+$/;

        return re.test(email);
    }

    // const handlePassInput = (e) => {
    //     if (e.target.value.length < 6 || e.target.value !== passRef.current.value) e.target.classList.add("is-invalid") 
    //     else e.target.classList.remove("is-invalid")
    // }

    return (
        <>
            <Container className="d-flex flex-column align-items-center justify-content-center"
            style={{minHeight: "100vh"}}>
                <Link to="/login" style={{textDecoration: "none", marginBottom: "0.5em"}}>return to Signing in <AiOutlineRight style={{strokeWidth: "100", stroke: "#0d6dfd"}}/></Link>
                <div className="w-100" style={{maxWidth: "400px"}}>
                    <Card>
                        <Card.Body>
                            <h2 className="text-center mb-4 font-weight-600">Recover Your Password</h2>
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
                                <Button className="w-100 mt-4" type="submit" disabled={isLoading}>Recover</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                    <div className="w-100 text-center mt-2">you don't have an account<Link to='/signup' style={{textDecoration: "none"}}>Signup</Link></div>
                </div>
            </Container>
        </>
    )
}
