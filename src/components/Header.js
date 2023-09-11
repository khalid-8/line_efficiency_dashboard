import React, {useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context';
import "./styles/header.css"
import { Container, Nav, Navbar } from 'react-bootstrap';
import useOutsideClick from './UseOutsideClick';

export default function Header() {
    const {currentUser} = useAuthContext()

    return(
        <>
        {currentUser?.user?
            <UserHeader/>
            :
            <NonUserHeader/>
        }
        </>
    );
    // return (
    //     <header id="app_header">
    //         <nav onClick={() => navigate('/')}>DashBoard</nav>
    //         <nav onClick={() => navigate('/input')}>Input</nav>
    //         {currentUser?.claim?.admin &&
    //             <nav onClick={() => navigate('/manage_users')}>Manage Users</nav>
    //         }
    //     </header>
    // );
}


function UserHeader(){
    const {currentUser} = useAuthContext()
    const navigate = useNavigate()

    const ref = useRef()

    useOutsideClick(ref, () => {
        if (ref.current?.childNodes[0]?.childNodes[3]?.classList?.contains("show")) ref.current.childNodes[0].childNodes[3].classList.remove("show")
    });

    return(
        <Navbar id="app_header" expand="md" ref={ref}>
            <Container className='header_container'>
                <img src={`${process.env.REACT_APP_HOSTING_SUBFOLDER}/imgs/profile-Image-placeHolder.jpeg`} className='user-img' alt='user avatar'
                onClick={() => {
                    navigate("/dashboard")
                }}/>

                <Navbar.Brand className="menu_title" onClick={() => navigate('/')}>
                    <img src={`${process.env.REACT_APP_HOSTING_SUBFOLDER}/imgs/dashboard_logo.svg`}
                    height="60"
                    className="d-inline-block align-top"
                    alt='dashboard logo'/>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse id="basic-navbar-nav" onClick={() => {
                    const menu = document.querySelector(".navbar-collapse")
                    if (menu.classList.contains("show")) menu.classList.remove("show")
                }}>
                    <Nav className="me-auto menu_navs">
                        <Nav.Link className='nav_item' onClick={() => {
                            navigate('/input')
                        }}>
                        Input
                        </Nav.Link>
                        {currentUser?.claim?.admin && 
                        <>
                        <hr/>
                        <Nav.Link className='nav_item' onClick={() => navigate('/manage_users')}>Manage Users</Nav.Link>
                        </>
                        }
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

function NonUserHeader(){
    const navigate = useNavigate()

    const ref = useRef()

    useOutsideClick(ref, () => {
        if (ref.current?.childNodes[0]?.childNodes[3]?.classList?.contains("show")) ref.current.childNodes[0].childNodes[3].classList.remove("show")
    });

    return(
        <Navbar id="app_header" expand="lg" ref={ref}>
            <Container className='header_container'>
                <span></span>
                <Navbar.Brand className="menu_title" onClick={() => navigate('/')}>
                    <img src={`${process.env.REACT_APP_HOSTING_SUBFOLDER}/imgs/dashboard_logo.svg`}
                    height="60"
                    className="d-inline-block align-top"
                    alt='dashboard logo'/>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav" onClick={() => {
                    const menu = document.querySelector(".navbar-collapse")
                    console.log(menu.classList)
                    if (menu.classList.contains("show")) menu.classList.remove("show")
                }}>
                    <Nav className="me-auto menu_navs">
                        <Nav.Link className='nav_item' onClick={() => navigate('/login')}>Login</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

//<Nav.Link className='nav_item' onClick={() => navigate('/')}>Dashboard</Nav.Link>

/*
<NavDropdown className='nav_item' title="Account" id="basic-nav-dropdown">
    <NavDropdown.ItemText>
        Account
    </NavDropdown.ItemText>
    <NavDropdown.ItemText>
        {currentUser.user.email}
    </NavDropdown.ItemText>
    <NavDropdown.Divider />
    <NavDropdown.Item className='logout_item' onClick={() => {
        logOut()
        navigate('/')
    }}>
        Log out
    </NavDropdown.Item>
</NavDropdown>
*/