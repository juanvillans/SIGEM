import React from "react";
import villasmil_foto from "../assets/img/villasmil_round.png";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
export default function Contacto() {
    return (
        <div>
            <h1 className="text-2xl mt-4 mb-4">Miembros del equipo:</h1>

            <div className="grid grid-cols-12 gap-5">
                <div className="neumorphism col-span-3 rounded-lg p-6 flex flex-col items-center">
                    <div className="overflow-hidden p-3 neumorphism w-40 aspect-square rounded-full">
                        <img
                            className="object-cover"
                            src={villasmil_foto}
                            alt=""
                        />
                    </div>
                    <h2 className="mt-5 text-xl font-bold tracking-wide  opacity-95">
                        Juan Villasmil
                    </h2>
                    <p className="mt-1 text-center opacity-80">
                        Co-fundador{" "}
                        <span className="opacity-50 font-bold mx-1">|</span>{" "}
                        director{" "}
                        <span className="opacity-50 font-bold mx-1">|</span>{" "}
                        programador Front end{" "}
                        <span className="opacity-50 font-bold mx-1">|</span>{" "}
                        diseñador
                    </p>

                    <a
                        href="mailto:juanvillans16@gmail.com"
                        target="_blank"
                        className="mt-2 neumorphism p-2 aspect-square rounded-full text-dark opacity-80"
                    >
                        <LinkedInIcon className=""></LinkedInIcon>
                    </a>
                </div>

                <div className="neumorphism col-span-3 rounded-lg p-6 flex flex-col items-center">
                    <div className="overflow-hidden p-3 neumorphism w-40 aspect-square rounded-full">
                        <img
                            className="object-cover"
                            src={villasmil_foto}
                            alt=""
                        />
                    </div>
                    <h2 className="mt-5 text-xl font-bold tracking-wide  opacity-95">
                        Juan Donquis
                    </h2>
                    <p className="mt-1 text-center opacity-80">
                        Co-fundador{" "}
                        <span className="opacity-50 font-bold mx-1">|</span>{" "}
                        director{" "}
                        <span className="opacity-50 font-bold mx-1">|</span>{" "}
                        programador Back end
                    </p>
                </div>

                <div className="col-span-6">
                    <h3 className="text-xl">
                        ¿Tienes alguna sugerencia o quiere reportar un error?
                    </h3>
                    <form action="">
                        <div className="neumorphism">
                            <textarea
                                className="w-full h-full bg-white p-5"
                                name=""
                                id=""
                                style={{
                                    backgroundColor: "rgba(233, 233, 233)",
                                }}
                                placeholder="Escribe aquí un mensaje para los desarrolladores"
                            ></textarea>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
