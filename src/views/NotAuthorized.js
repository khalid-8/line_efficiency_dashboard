import React from 'react';
import "./styles/notAuthorized.css";
import { IoIosWarning } from 'react-icons/io';

function NotAuthorized() {
    return (
        <main id="notAuth" >
            <div>
                <IoIosWarning className='notAuth_icon'/>
            </div>

            <h1>Sorry, You Don't have Permission to Access this Page</h1>
        </main>
    );
}

export default NotAuthorized;