import React, { forwardRef, useRef } from "react";
import cintillo from "../assets/img/cintillo.jpeg";
import logo from "../assets/img/logo.webp";
import { useReactToPrint } from "react-to-print";
import "../css/components/PrintableContent.css";

const PrintContent = forwardRef((props, ref) => {
  // eslint-disable-line react/prop-types
  return (
    <div ref={ref} className="printable-container">
      <div className="report-header flex justify-between items-center print-flex mb-1">
        <img
          src={cintillo}
          alt="cintillo"
          className="w-72 mt-2 h-max print-img-large"
        />
        <img src={logo} alt="logo" className="w-9 h-auto print-img-small" />
      </div>
      <p className="">
        Fecha de emisión: <b> {new Date().toLocaleDateString()}</b>
      </p>
      <p className="">
        Centro de salud: <b>{props?.entityName}</b>{" "}
      </p>

      <h1 className="report-title">INVENTARIO DE EQUIPOS MÉDICOS</h1>
      <table
        className="print-table border  border-grey w-full"
        aria-label="simple table"
        style={{ colorAdjust: "exact", printColorAdjust: "exact" }}
      >
        <thead className=" border-b bg-blue1 text-white border-dark text-xs">
          <tr className="">
            <th className="print-header ">Nº</th>
            <th className="print-header">Area</th>
            <th className="print-header">Equipo Médico</th>
            <th className="print-header">Marca</th>
            <th className="print-header">Modelo</th>
            <th className="print-header">Serial</th>
            <th className="print-header">Bien Nacional</th>
            <th className="print-header">Estado</th>
          </tr>
        </thead>
        <tbody className="inventoryTbody" >
          {props?.products.map((product, rowIndex) => {
            return (
              <tr key={rowIndex} >
                <td className="px-2 ">{rowIndex + 1}</td>
                <td className="px-2 ">{product.Area}</td>
                <td className="px-2 ">{product.Equipo}</td>
                <td className="px-2 ">{product.Marca}</td>
                <td className="px-2 ">{product.Modelo}</td>
                <td className="px-2 ">{product.Serial}</td>
                <td className="px-2 ">{product.Bien_nacional}</td>
                <td className="px-2 ">{product.Estado}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-4">Personal electromédico a cargo: ___________________________ </p>
      <p>Cordinador del centro: __________________________</p>
    </div>
  );
});

const InventoryReport = ({ products, entityName }) => {
  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "Inventario Report",
    pageStyle: `
    @page {
      size: A3 landscape; /* o 'landscape' para horizontal */
      margin: 10mm 30mm; /* Ajusta los márgenes si es necesario */
      
    }
    
    /* Opcional: Estilos adicionales para el contenido */
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  `,
  });

  return (
    <div>
      <button
        onClick={handlePrint}
        className="bg-blue2 hover:bg-blue1 mx-auto block mb-4 text-white font-bold py-2 px-4 rounded-full"
      >
        Imprimir / Guardar PDF
      </button>
      <PrintContent
        ref={componentRef}
        products={products}
        entityName={entityName}
      />
    </div>
  );
};

export default InventoryReport;
