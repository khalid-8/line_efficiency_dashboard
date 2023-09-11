import React from 'react';
import { Container, Navbar } from 'react-bootstrap';
import "./styles/footer.css"

function Footer() {
    return (
        <Navbar id="app_footer">
            <Container className='footer_container'>
                <Navbar.Brand className="footer_menu_title">
                    <img src={`${process.env.REACT_APP_HOSTING_SUBFOLDER}/imgs/Juffali_Carrier.png`}
                    className="d-inline-block align-top"
                    alt='dashboard footer logo'/>
                </Navbar.Brand>
                <Navbar.Text className='footer_desc'>
                    Line Efficiency Dashboard, is web application used to monitor the efficiency of SAMCO production lines by measuring their targets and actual production
                </Navbar.Text>
                <div className='footer_desc footer_copyRights'>
                    Developed & Designed by Khalid Alnahdi
                </div>
            </Container>
        </Navbar>
    );
}

export default Footer;