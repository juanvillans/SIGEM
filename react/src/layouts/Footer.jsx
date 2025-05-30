import React from "react";
import {Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className={`main_footer`}>
            <nav>
                <Link to="./Contacto" target="_blank">Contacta a los desarrolladores</Link>
                {/* <Link to="" target="_blank">Reportar error</Link>
                <Link to="" target="_blank">Video tutorial</Link> */}
            </nav>
        </footer>
    );
}
