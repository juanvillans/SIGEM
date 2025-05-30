import { useEffect, useState } from "react";
import axios from "../api/axios";
import StoreIcon from "@mui/icons-material/Store";

export default function ExpandRowInventory(props) {
  const [row, setRow] = useState(<p className="p-2"> Cargando...</p>);
  useEffect(() => {
    detailtInventory();
  }, []);
  const detailtInventory = async (
    id = props.productId,
    entityCode = props.entityCode
  ) => {
    axios
      .get(`dashboard/detail-inventory/${id}/${entityCode}`)
      .then((response) => {
        const lots = response.data.lotsPerOrigin;
        setRow(
          <tr>
            <td colSpan={5}>
              <div>
                <table aria-label="simple table">
                  <thead>
                    <tr className="text-left text-xs">
                      <th className="noPadding p-1 px-3 w-[130px] min-w-[130px]">
                        Lote
                      </th>
                      <th className="noPadding p-1 px-3 w-[105px] min-w-[105px]">
                        F. de vencimiento
                      </th>
                      <th className="noPadding p-1 px-3 w-[89px] min-w-[89px]">
                        Cantidad
                      </th>
                      <th className="noPadding p-1 px-3 w-[105px] min-w-[105px] max-w-[105px]">
                        Condición
                      </th>
                      <th className="noPadding p-1 px-3">Origen</th>
                      <th className="noPadding p-1 px-3">Total Bueno</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(lots).map(([key, value]) => {
                      return (
                        <tr
                          colSpan={4}
                          className="border border-blue1 border-opacity-40"
                        >
                          <td colSpan={4}>
                            {[
                              ...value.perExpire,
                              ...value.good,
                              ...value.bad,
                              ...value.expired,
                            ].map((row) => {
                              const conditionColor = () => {
                                if (row.conditionId == 3) {
                                  return "bg-red text-white";
                                } else if (row.conditionId == 2) {
                                  return "bg-orange text-white";
                                } else if (
                                  row.conditionId == 1 ||
                                  row.conditionId == 4
                                ) {
                                  return "bg-blue3 text-blue1";
                                }
                              };
                              return (
                                <tr
                                  key={row.loteNumber}
                                  className={` cursor-pointer hover:brightness-50 ${conditionColor()} w-full text-sm`}
                                >
                                  <td
                                    className={`w-[130px] p-2 px-2 pl-3 border-b border-opacity-80  bg-light bg-opacity-20 border-light `}
                                    scope="row"
                                  >
                                    {row.loteNumber}
                                  </td>
                                  {row.conditionId == 4 ? (
                                    <td className="text-red font-bold p-2 px-2 pl-3 border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                                      {row.expirationDate}
                                      <RunningWithErrorsIcon className="relative -top-1.5" />
                                    </td>
                                  ) : (
                                    <td className="w-[105px]  p-2 px-2 pl-3 border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                                      {row.expirationDate}
                                    </td>
                                  )}

                                  <td className="w-[89px] min-w-[80px] p-2 px-2 pl-3 border-b border-opacity-80 font-bold bg-light bg-opacity-20 border-light">
                                    {row.stock}
                                  </td>
                                  <td className="w-[105px] min-w-[105px] max-w-[105px] text-sm p-2 px-2 pl-3 border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                                    {row.conditionName}
                                  </td>
                                </tr>
                              );
                            })}
                          </td>
                          <td className="p-3 text-xs">
                            {value.organizationCode !== "nocode" ? (
                              <span className="text-blue1">
                                <StoreIcon style={{ fontSize: "15px" }} />
                              </span>
                            ) : (
                              ""
                            )}{" "}
                            {value.name}
                          </td>
                          <td className="p-3">
                            {value.good.reduce(
                              (acc, obj) => acc + obj.stock,
                              0
                            )}
                          </td>
                        </tr>
                      );
                    })}
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
