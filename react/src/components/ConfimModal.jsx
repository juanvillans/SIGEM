import { useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";

export default function ConfirmModal(props) {
    const [isOpen, setIsOpen] = useState(props.isOpen);
    const [content_submit, setContent_submit] = useState("Confirmar");
    return (
        <form
            id="container_modal"
            onClick={(e) => {
                props.closeModal();
            }}
            className={`${
                props.isOpen ? "flex" : "hidden"
            } fixed w-full h-full top-0 left-0 z-50 justify-center items-center`}
        >
            <div
                onClick={(e) => e.stopPropagation()} 
                className=" min-w-[310px] max-w-[700px] min-h-[140px] flex flex-col justify-between bg-dark text-white shadow-md rounded-md p-5 text-center"
            >
                <div>
                    <p>{props.textInfo}</p>
                    {props.modalInfo || (
                        <p>¿Está seguro de realizar esta acción?</p>
                    )}
                    {/* {props.content} */}
                </div>
                <footer className="w-full flex justify-between mt-5">
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            props.closeModal()}}
                        className="py-2 px-3 rounded-md"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={async (e) => {
                            e.preventDefault()
                            setContent_submit(<CircularProgress color="inherit"/>);
                            
                            await props.aceptFunction();
                            props.closeModal();
                            setContent_submit('Confirmar')
                        }}
                        className="bg-purple py-2 px-3 rounded-md text-white bg-red"
                    >
                        {content_submit}
                    </button>
                </footer>
            </div>
        </form>
    );
}
// ${props.isOpen ? 'block' : 'hidden'}
