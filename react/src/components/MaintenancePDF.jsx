import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import membrete from "../assets/img/membrete.png";
import "../css/components/PrintableContent.css";
const PrintableContent = React.memo(
  React.forwardRef((props, ref) => {
    console.log({ props, ref });
    return (
      <div ref={ref} className="printable-container">
        <header className="report-header">
          <img src={membrete} alt="" className="logo " />

          <div className="text-center ">
            <h1 className="report-title">Reporte de servicio técnico</h1>
          </div>
        </header>

          <div className="info-grid">
            <div className=" border-b my-2 w-full relative justify-center items-center py-4 flex -">
              <div className="px-1 border-r">
                <p className="text-bold">Centro de salud:</p>
              </div>
              <div className="col-auto w-full">
                <div className="info-row-item-border-bottom flex px-1">
                  <p className=""><span className="text-bold">Nombre:</span> {props.data.entity_name}</p>
                </div>
                <div className=" flex px-1">
                  <p className=""><span className="text-bold">Servicio:</span>  {props.data.area}</p>
                </div>
              </div>
            </div>

            <div className="info-grid-2 flex container_flex_item border-b justify-between">
              <div className=" border-r ">
                <p className="px-1 text-bold border-b  ">
                  Equipo médico:
                </p>
                <p className="px-1"> {props.data.product_name}</p>
              </div>
              <div className="border-r">
                <p className="px-1 text-bold border-b  grid-item-text-center ">
                  Marca:
                </p>
                <p className="px-1"> {props.data.product_brand}</p>
              </div>
              <div className="border-r">
                <p className="px-1 text-bold border-b  grid-item-text-center ">
                  Modelo:
                </p>
                <p className="px-1"> {props.data.product_model}</p>
              </div>
              <div className="border-r">
                <p className="px-1 text-bold border-b  grid-item-text-center ">
                  Serial:
                </p>
                <p className="px-1"> {props.data.serial_number}</p>
              </div>
              <div >
                <p className="px-1 text-bold border-b  grid-item-text-center ">
                  B/N:
                </p>
                <p className="px-1"> {props.data.national_code}</p>
              </div>
            </div>

            <div className="flex border-b px-1 gap-3">
                <p className=" text-bold ">
                  Tipo de mantenimiento:
                </p>
                <p> {props.data.type_maintenance_name}</p>
            </div>

             <div className="flex border-b px-1 gap-3">
                <p className=" text-bold ">
                  Status:
                </p>
                <p> {props.data.machine_status_name}</p>
            </div>
           

            <div>
              <p className="px-1 grid-item-text-center text-bold grid-item-border-bottom ">
                Descripción técnica:
              </p>
              <p className="px-1 border-b"> {props.data.description}</p>
            </div>

            <div className="flex ">
              <div className="w50 border-r px-1 pb-7">
                <p className="text-bold  ">
                  Elaborado por:
                </p>
                <p>Div. Electromedicina Regional </p>
              </div>
              <div className="w50 px-1 pb-7">
                <p className="text-bold ">
                  Centro de salud:
                </p>
              </div>
            </div>
          </div>
      </div>
    );
  })
);

const PrintPage = React.memo(function PrintPage(props) {
  console.log({ props });
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Mantenimiento_${props.data.id}_${props.data.type_maintenance_name}_${props.data.product_name}-${props.data.created_at}`,
    copyStyles: true,
    pageStyle: `
      @page {
        margin: 20mm;
        size: A4;

      }
      body {
        font-family: Arial, sans-serif;
        color: black;
      }
    `,
  });

  return (
    <div>
      {props.isHidden ? (
        <button onClick={handlePrint} title="Imprimir">
          <LocalPrintshopIcon />
        </button>
      ) : (
        <div className="flex justify-center mb-4">
          <button
            onClick={handlePrint}
            title="Imprimir"
            className="flex gap-2 text-xl mx-auto py-1 px-2 "
          >
            <LocalPrintshopIcon />
            <span>Descargar / Imprimir</span>
          </button>
        </div>
      )}

      <div className={props.isHidden ? "hidden" : ""}>
        <PrintableContent
          data={props.data}
          ref={componentRef}
          className=""
          size="A4"
        />
      </div>
    </div>
  );
});

export default PrintPage;
