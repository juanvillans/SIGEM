import { useEffect, useState } from "react";
import axios from "../api/axios";
const requestesStatutes = {
  0: { color: "whitesmoke", description: "Sin respuesta" },
  1: { color: "#a7d5f28e", description: "aceptado con menos cantidad" },
  2: { color: "#", description: "aceptado con la cantidad justa" },
  3: { color: "#A7D5F2", description: "aceptado con mayor cantidad" },
  4: { color: "#", description: "añadido sin ser solicitado" },
};
export default function ExpandRowProducts(props) {
  const [row, setRow] = useState(<p className="p-2"> Cargando...</p>);
  useEffect(() => {
    products();
  }, []);

  function resaltProductWhenSearch(tableSearchText) {
    setTimeout(() => {
      document.querySelectorAll(".productTd").forEach((allTd) => {
        if (tableSearchText.length > 1) {
          // Normalize the search text by removing numbers and extra spaces, but keep the "x"
          const normalizedSearchText = tableSearchText
            .toLowerCase() // Convert to lowercase
            .replace(/\d+/g, "") // Remove numbers
            .replace(/\s+/g, " ") // Replace multiple spaces with a single space
            .trim();

          // Normalize the cell text
          const cellText = allTd.textContent;
          const normalizedCellText = cellText
            .toLowerCase() // Convert to lowercase
            .replace(/\d+x/g, "") // Remove numbers followed by "x" (e.g., "10x")
            .replace(/\d+/g, "") // Remove any remaining numbers
            .replace(/\s+/g, " ") // Replace multiple spaces with a single space
            .trim();
          console.log("Normalized Search Text:", normalizedSearchText);
          console.log("Normalized Cell Text:", normalizedCellText);
          // Check for a match using includes
          if (normalizedCellText.includes(normalizedSearchText)) {
            let trProduct = allTd.closest("tr");
            trProduct.style.background = "#FFFF00";
          }
        }
      });
    }, 200);
  }

  const products = async (
    id = props.id,
    code = props.code,
    entityCode = props.entityCode
  ) => {
    axios.get(`dashboard/detail-${props.route}/${id}`).then((response) => {
      let products = [];
      if (props.status == 6) {
        let outputs = response.data.outputs;
        let hashMap = {};
        for (let i = 0; i < response.data.products.length; i++) {
          let product = response.data.products[i];
          hashMap[product.productId] = {
            color: "whitesmoke",
            ...product,
            indx: i,
            requestStatus: 0,
            sendedQuantity: "Rechazado",
          };
        }
        for (let i = 0; i < outputs.length; i++) {
          let output = outputs[i];
          if (hashMap[output.productId]) {
            let product = hashMap[output.productId];
            let requestedQuantity = product.requestedQuantity;
            if (product.sendedQuantity !== "Rechazado") {
              product.sendedQuantity += output.quantity;
            } else {
              product.sendedQuantity = output.quantity;
            }
            if (product.sendedQuantity < requestedQuantity) {
              // console.log({output, product});
              product.requestStatus = 1;
              // product.porcentageColor = (product.sendedQuantity / requestedQuantity) * 100
              product.color = `hwb(203 65% 5% / .${
                (product.sendedQuantity / requestedQuantity) * 100
              })`;
            } else if (product.sendedQuantity == requestedQuantity) {
              product.requestStatus = 2;
              product.color = "#A7D5F2";
            } else if (product.sendedQuantity > requestedQuantity) {
              product.requestStatus = 3;
              product.color = "#96cdf0";
            }
          } else {
            hashMap[output.productId] = {
              color: "#20597a88",
              requestStatus: 4,
              ...output,
              sendedQuantity: output.quantity,
              requestedQuantity: "No solicitado",
            };
          }
        }
        products = Object.values(hashMap);
      } else {
        products = response.data.products;
      }
      if (props?.tableSearchText && props.tableSearchText.length > 1) {
        resaltProductWhenSearch(props.tableSearchText);
      }

      props.handleSelectRow?.({
        ...props.data,
        products: products,
        organization: response?.data?.organization || false,
      });
      setRow(
        <tr>
          <td colSpan={10}>
            <div>
              <table
                style={{ minWidth: "650", marginLeft: "40px" }}
                aria-label="simple table"
              >
                <thead className="text-blue1">
                  <tr className="text-left">
                    <th className="p-2 py-1">N°</th>
                    {!props.isForRequest && <th className="p-2 py-1">Lote</th>}
                    <th className="p-2 py-1">Cód. p</th>

                    <th className="p-2 py-1">Producto</th>
                    <th className="p-2 py-1">
                      {props?.status == 6 ? " Cant. solicitada" : "Cantidad"}
                    </th>
                    {props.isForRequest && props?.status == 6 && (
                      <th className="p-2 py-1">Cant. enviada</th>
                    )}
                    {!props.isForRequest && (
                      <>
                        <th className="p-2 py-1">F. de vencimiento</th>
                        <th className="p-2 py-1">Condición</th>
                        <th className="p-2 py-1">Categoria</th>
                        <th className="p-2 py-1">T. de medicamento</th>
                        <th className="p-2 py-1">Observación</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {products.map((row, indx) => (
                    <tr
                      key={row.loteNumber}
                      className="cursor-pointer text-sm bg-blue3 bg-opacity-50"
                      style={{ backgroundColor: row.color }}
                    >
                      <td
                        className="p-2 px-3 pl-5 border-b border-opacity-80  bg-light bg-opacity-20 border-light"
                        scope="row"
                      >
                        {indx + 1}
                      </td>

                      {!props.isForRequest && (
                        <td
                          className="p-2 px-3 pl-5 border-b border-opacity-80  bg-light bg-opacity-20 border-light"
                          scope="row"
                        >
                          {row.loteNumber}
                        </td>
                      )}

                      <td
                        className="p-2 px-3 pl-5 border-b border-opacity-80  bg-light bg-opacity-20 border-light"
                        scope="row"
                      >
                        {row.code}
                      </td>
                      <td className="productTd p-2 px-3 pl-5 border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                        <span>
                          <b>{row.name}</b>{" "}
                          {row.unitPerPackage > 1 ? (
                            <span className="text-green font-semibold">
                              {row.unitPerPackage}
                              <small>x</small>{" "}
                            </span>
                          ) : (
                            <span>{row.unitPerPackage}</span>
                          )}{" "}
                          {row.typePresentationName != "N/A"
                            ? row.typePresentationName
                            : ""}{" "}
                          {row.concentrationSize != "N/A" && (
                            <b style={{ color: "#187CBA" }}>
                              {" "}
                              {row.concentrationSize}
                            </b>
                          )}
                        </span>
                      </td>

                      <td className="p-2 px-3 pl-5 font-bold border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                        {props.isForRequest
                          ? row.requestedQuantity
                          : row.quantity}
                      </td>
                      {props.isForRequest && (
                        <td className="p-2 px-3 pl-5 font-bold border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                          {row.sendedQuantity}
                        </td>
                      )}
                      {!props.isForRequest && (
                        <>
                          <td className="p-2 px-3 pl-5 border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                            {row.expirationDate}
                          </td>
                          <td className="p-2 px-3 pl-5 border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                            {row.conditionName}
                          </td>
                          <td className="p-2 px-3 pl-5 border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                            {row.categoryName}
                          </td>
                          <td className="p-2 px-3 pl-5 border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                            {row.medicamentName}
                          </td>
                          <td className="p-2 px-3 pl-5 border-b border-opacity-80 min-w-[400px] bg-light bg-opacity-20 border-light">
                            {row.description}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      );
    });
  };

  return row;
}
