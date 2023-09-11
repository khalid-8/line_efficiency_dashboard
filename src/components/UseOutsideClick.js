import { useEffect } from "react";

export default function useOutsideClick(ref, callback) {
    const handleClick = e => {
        if(ref?.childNodes?.length > 1 && !ref?.contains(e.target)){
            callback();
        }
        if ( ref?.current && !ref?.current?.contains(e.target)) {
            callback();
        }
    };

    useEffect(() => {
        document.addEventListener("click", handleClick);

        return () => {
        document.removeEventListener("click", handleClick);
        };
    });
};