import React, { useEffect, useRef, useState } from 'react'
import '../styles/ManageUsers.css'
import { Button, Card, Container, Form } from 'react-bootstrap'
import { AiOutlineCheck } from 'react-icons/ai'
import { BsThreeDotsVertical } from 'react-icons/bs'
import { HiX } from "react-icons/hi"
import { LoadingCards, useOutsideClick } from '../../components'
import { useAuthContext, useConfirmationContext, useUsersContext } from '../../context'
import { API } from '../../helpers'
import { GrClose } from 'react-icons/gr'

export default function ManageUsers() {
    const [currentRef, setCurrentRef] = useState()
    const [approvedUsers, setApprovedUsers] = useState([])
    const [notApprovedUsers, setNotApprovedUsers] = useState([])
    const [showUserInfo, setShowUserInfo] = useState(false)
    const [userInfo, setUserInfo] = useState()

    const userRef = useRef([]) 

    const {showConfirmationAlert} = useConfirmationContext()
    const {currentUser} = useAuthContext()
    const { listUser, removeUser } = useUsersContext()

    useOutsideClick(currentRef, () => {
        currentRef.childNodes[1].style.display = "none"
    });
    
    const handleThreeDotsClick = (i) => {
        if(currentRef) currentRef.childNodes[1].style.display = "none"
        setCurrentRef(userRef.current[i])
        const el = userRef.current[i].childNodes[1]
        el.style.display = `${el.style.display === "none"? "block" : "none" }`
    }

    useEffect(() =>{
        if(!listUser || listUser?.length < 1) return
        console.log(listUser)
        console.log(!listUser)
        console.log(listUser?.length < 1)

        setApprovedUsers([])
        setNotApprovedUsers([])

        listUser?.forEach((item, i) => {
            if (item?.customClaims?.approved) return setApprovedUsers((prev) => [...prev, item])
            setNotApprovedUsers((prev) => [...prev, item])
        })
        
    }, [listUser])

  return (
    <main>
        <Container>
            {showUserInfo && <UserInfoCard user={userInfo} show={showUserInfo} hide={setShowUserInfo}/>}
            <Card className='m-2'>
                <Card.Body className='users-container-card'>
                    <b className='mb-4'>Users</b>
                    {approvedUsers.length < 1 && <LoadingCards/>}
                    { approvedUsers && 
                        approvedUsers.map((item, i) => (
                            <Card style={{width: "9em", marginTop: "1em"}} key={item.uid}>
                                <Card.Body className='d-flex flex-column text-center p-2' ref={el => userRef.current[i] = el}>
                                    {
                                        <>
                                        <BsThreeDotsVertical className="threeDots-icon"
                                        onClick={() => {handleThreeDotsClick(i)}}/>
                                        <div className='user-operations-opts'>
                                            <nav className={`${!currentUser?.claim?.admin? "disabled" : ""}`}
                                            onClick={async() => {
                                                if (!currentUser?.claim?.admin) return false
                                                const result = await showConfirmationAlert({head: `${item?.customClaims?.admin? "خفض صلاحيات" : "رفع صلاحيات"}`, body: `هل انت متأكد انك تريد تغيير صلاحيات ${item.email}`})
                                                if(result){
                                                    await API.userToAdmin({
                                                        email: item.email,
                                                        uid: item.uid,
                                                        admin: item?.customClaims?.admin? false : true
                                                    })
                                                }
                                            }}>
                                                make {`${item?.customClaims?.admin? "user": 'admin'}`}
                                            </nav>
                                            <hr/>
                                            <nav className={`${!currentUser?.claim?.admin? "disabled" : ""}`}
                                            onClick={async() => {
                                                if (!currentUser?.claim?.admin) return false
                                                const result = await showConfirmationAlert({head: `Change Privileges!`, body: `are you sure you want to change ${item.email}'s privileges?`})
                                                if(result){
                                                    await API.makePlanner({
                                                        email: item.email,
                                                        uid: item.uid,
                                                        planner: item?.customClaims?.planner? false : true
                                                    })
                                                }
                                            }}>
                                                make {`${item?.customClaims?.planner? "user": 'planner'}`}
                                            </nav>
                                            <hr/>
                                            <nav className={`${!currentUser?.claim?.admin? "disabled" : ""}`}
                                            onClick={async() => {
                                                if (!currentUser?.claim?.admin) return false
                                                const result = await showConfirmationAlert({head: `Change Privileges!`, body: `are you sure you want to change ${item.email}'s privileges?`})
                                                if(result){
                                                    await API.makeProduction({
                                                        email: item.email,
                                                        uid: item.uid,
                                                        production: item?.customClaims?.production? false : true
                                                    })
                                                }
                                            }}>
                                                make {`${item?.customClaims?.planner? "user": 'production'}`}
                                            </nav>
                                            <hr/>
                                            <nav onClick={() => {
                                                setUserInfo(item)
                                                setShowUserInfo(true)
                                            }}>
                                                User Info
                                            </nav>
                                            <hr/>
                                            <nav onClick={async() => {
                                                const result = await showConfirmationAlert({head: "Delete User", body: `Are you sure that you want to delete ${item.email}!`})
                                                if (result){
                                                    await API.deleteUser(item.uid).then(() => {
                                                        setApprovedUsers(approvedUsers.filter(user => user.uid !== item.uid))
                                                    })
                                                }
                                            }}>
                                                delete
                                            </nav>
                                        </div>
                                        </>
                                    }
                                    <img src={item.photoURL} alt='avatar' className='avatar-pic'/>
                                    <small style={{fontWeight: "100", fontSize: "12px", marginTop: "7px"}}>{`${item?.customClaims?.admin? 'admin' : (item?.customClaims?.planner? 'planner' : (item?.customClaims?.production? "production": 'user'))}`}</small>
                                    <strong className="card-name">{`${item.displayName? item.displayName : item.email}`}</strong>
                                </Card.Body>
                            </Card>
                        ))
                    }
                </Card.Body>
            </Card>

            <Card className='m-2'>
                <Card.Body className='users-container-card'>
                    <b className='mb-4'>new Users</b>
                    {notApprovedUsers?.length > 0?
                        notApprovedUsers.map((item) => (
                            <Card style={{width: "9em"}} key={item.uid}>
                                <Card.Body className='d-flex flex-column text-center p-2'>
                                    <img src={item.photoURL} alt='avatar' className='avatar-pic'/>
                                    <small style={{fontWeight: "100", fontSize: "12px", marginTop: "7px"}}>{`${item?.customClaims?.admin? 'admin' : 'user'}`}</small>
                                    <strong className="card-name">{`${item.displayName? item.displayName : item.email}`}</strong>
                                </Card.Body>
                                <Card.Footer className='d-flex flex-row justify-content-center'
                                style={{padding: "0", textAlign: "center"}}>
                                    <div className='accept-member manage-new-user'
                                    onClick={async() => {
                                        await API.approveUser({
                                            email: item.email,
                                            uid: item.uid,
                                            approve: true
                                        }).then(() => {
                                            setApprovedUsers((prev) => [...prev, item])
                                            setNotApprovedUsers(notApprovedUsers.filter(user => user.uid !== item.uid))
                                        })
                                        console.log("accepted")    
                                    }}>
                                        <AiOutlineCheck id='checkMark'/>
                                    </div>
                                    <div className="vr"></div>
                                    <div className='refuse-member manage-new-user'
                                    onClick={async() => {
                                        const result = await showConfirmationAlert({head: "Delete User", body: `Are you sure that you want to delete ${item.email}!`})
                                        if (result){
                                            try{
                                                setNotApprovedUsers(notApprovedUsers.filter(user => user.uid !== item.uid))
                                                await API.deleteUser(item.uid)
                                                removeUser(item.uid)
                                            }catch(err){
                                                console.log(err)
                                            }
                                            
                                        }
                                    }}>
                                        <HiX id='xMark'/>
                                    </div>
                                </Card.Footer>
                            </Card>
                        ))
                        :
                        <small style={{color: "gray"}}>there are no new users</small>
                    }
                </Card.Body>
            </Card>
        </Container>

    </main>
  )
}


const UserInfoCard = ({user, show, hide}) =>{
    const [showPassRest, setShowPassRest] = useState(false)
    const [cantSubmit, setCantSubmit] = useState(true)
    const [isLoading, setIsLoading] = useState(false)

    const passRef = useRef()
    const confirmPassRef = useRef()

    const dateFormater = (date) => {
        if(!date) return
        return new Date(date).toLocaleString("en-US", {
            dateStyle: 'medium', timeStyle: 'medium', timeZone: "Asia/Riyadh"
        })
    }

    const handlePassInput = (e) => {
        if (e.target === confirmPassRef.current){
            if (e.target.value.length < 6 || e.target.value !== passRef.current.value){
                setCantSubmit(true)
                return e.target.classList.add("is-invalid") 
            }
            setCantSubmit(false)
            e.target.classList.remove("is-invalid")
            return
        }
        if (e.target.value.length < 6){
            setCantSubmit(true)
            return e.target.classList.add("is-invalid") 
        }
        e.target.classList.remove("is-invalid")
    }

    const handleSubmit = async() =>{
        if(passRef.current.value < 6 || confirmPassRef.current.value < 6){
            if (passRef.current.value < 6) passRef.current.classList.add("is-invalid") 
            if (confirmPassRef.current.value < 6) confirmPassRef.current.classList.add("is-invalid") 
            return
        }

        if (passRef.current.value !== confirmPassRef.current.value){
            setCantSubmit(true)
            return confirmPassRef.current.classList.add("is-invalid") 
            // return setErrorMsg("الارقام السرية لا تتطابق")
        }

        setIsLoading(true)
        // setErrorMsg('')
        await API.changeUserPass(user.uid, passRef.current.value)

        setCantSubmit(true)
        setShowPassRest(false)
        setIsLoading(false)
    }

    return(
        <>
        { show &&
            <Card className='user-info-card'>
                <Card.Body className='d-flex flex-column justify-content-center text-center'>
                    <GrClose color='red' className='close-user-info-card' onClick={() => hide(false)}/>
                    <small>{user?.email}</small>
                    {console.log(user)}
                    {user?.emailVerified?
                        <small style={{color: 'green', fontSize: "10px", marginTop: "0", paddingTop: '0'}}>Verified</small>
                        :
                        <small style={{color: 'red', fontSize: "10px", marginTop: "0", paddingTop: '0'}}>Not Verified</small>
                    }
                    <div className='user-info-div'>
                        <small>Account Creation Date</small>
                        <small className='user-info-date'>{dateFormater(user?.metadata?.creationTime)}</small>
                    </div>
                    <div className='user-info-div'>     
                        <small>Last Log in</small>
                        <small className='user-info-date'>{dateFormater(user?.metadata?.lastSignInTime)}</small>
                    </div>
                    {showPassRest &&
                        <div style={{marginTop: "1em"}}>
                        <Form.Group id="password" className="mb-3">
                            <Form.Label><small>new Password</small></Form.Label>
                            <Form.Control type="password" 
                            ref={passRef}
                            autoComplete={"new-password"}
                            // placeholder="اتركه فارغ ان كنت لا ترغب بالتحديث"
                            onChange={handlePassInput}/>
                            <div className="mt-1">
                                <p className="mb-0" style={{fontSize: "12px",fontWeight: "100"}}>*Password must at least contains 6 characters</p>
                            </div>
                        </Form.Group>
                        <Form.Group id="passwordConfirmation" className="mb-3">
                            <Form.Label> <small>Password Confirmation</small> </Form.Label>
                            <Form.Control type="password" ref={confirmPassRef}
                            autoComplete={"new-password"}
                            //placeholder="اتركه فارغ ان كنت لا ترغب بالتحديث"
                            onChange={handlePassInput}/>
                            <div className="mt-1">
                                <p style={{fontSize: "12px",fontWeight: "100"}}>*Passwords must match</p>
                            </div>
                        </Form.Group>
                        </div>
                    }
                    <Button className={`${showPassRest && 'custom-btn'}`} variant={`${!showPassRest && 'danger'}`} style={{marginTop: ".5em"}}
                    disabled={showPassRest? (isLoading || cantSubmit) : false}
                    onClick={(e) => {
                        if(!showPassRest) return setShowPassRest(true)
                        handleSubmit(e)
                    }}>
                        {showPassRest? "Confirm new Password" : "Change Password" }                    
                    </Button> 
                    {showPassRest && 
                        <small className="w-100 text-center mt-2" style={{textAlign: "center", color: "red", cursor: "pointer"}}
                            onClick={() => {
                                setCantSubmit(true)
                                setShowPassRest(false)
                            }}
                        >
                            Cancel
                        </small>
                    }
                </Card.Body>
            </Card>
        }
        </>
    )
} 