import React, { useEffect, useState, useMemo } from "react";
import axios from "../api/axios";
import { ResponsivePie } from "@nivo/pie";
import Input from "../components/Input";

import MenuItem from "@mui/material/MenuItem";

const PieChart = React.memo(({ data, inPorcentage }) => (
  <ResponsivePie
    data={data}
    innerRadius={0.5}
    margin={{ top: 30, right: 80, bottom: 50, left: 80 }}
    padAngle={0.6}
    cornerRadius={2}
    activeOuterRadiusOffset={8}
    arcLinkLabelsSkipAngle={10}
    arcLinkLabelsTextColor="#333333"
    arcLinkLabelsThickness={2}
    valueFormat={(value) => `${Number(value)}${inPorcentage ? " %" : ""}`}
    arcLinkLabelsColor={{ from: "color" }}
    arcLabelsSkipAngle={10}
    arcLabelsTextColor={{
      from: "color",
      modifiers: [["darker", 4]],
    }}
  />
));

export default function IndexDashboard(props) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [entityCode, setEntityCode] = useState(props.userData.entityCode);

  const [entities, setEntities] = useState([]);
  
  async function fetchEntities() {
    try {
      const res = await axios.get("/dashboard/relation?entities=true");
      setEntities(res.data.entities);
    } catch (e) {
      console.error("Failed to fetch entities", e);
    }
  }

  async function fetchChartData(entityCode = props.userData.entityCode) {
    setLoading(true);
    try {
      const res = await axios.get(
        `/dashboard/statistics?entity_code=${entityCode}`,
      );
      setChartData(res.data);
    } catch (e) {
      console.error("Failed to fetch chart data", e);
    }
    setLoading(false);
  }
  useEffect(() => {
    fetchEntities();
  }, []);
  
  useEffect(() => {
    fetchChartData();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-10 lg:px-10 pt-10 lg:pt-16">
      <div className="col-span-2 flex gap-3">
        <h1 className="text-xl font-bold mb-4 opacity-65">Estadísticas de</h1>
        {props.userData.entityCode == 1 && (
          <span className="relative col-span-2 -top-2 ">
            <Input
              name="user_type"
              id=""
              select
              value={entityCode}
              // value={props.userData.entityCode}
              size="small"
              className=" bg-blue/0 py-1 font-bold w-max"
              onChange={(e) => {
                setEntityCode(e.target.value);
                fetchChartData(e.target.value);

              }}
              // value={user_type_selected}
            >
              {entities?.map((option) => (
                <MenuItem key={option.code} value={option.code}>
                  {option.name}
                </MenuItem>
              ))}

              <MenuItem key={"todos"} value={"*"}>
                Todos
              </MenuItem>
            </Input>
          </span>
        )}
      </div>
      {chartData &&
      Array.isArray(chartData.maintenances_per_type) &&
      chartData.maintenances_per_type.length > 0 ? (
        <div className="rounded-2xl p-4 md:p-7 md:pb-10  min-h-[300px] relative  neuphormism hover:shadow-none">
          <h2 className="text-xl font-bold mb-4 opacity-65">
            Mantenimientos por tipo
          </h2>
          <PieChart data={chartData.maintenances_per_type} />
        </div>
      ) : (
        <div className="flex justify-center items-center h-[250px]">
          {loading ? (
            <div className="flex col-span-2 justify-center items-center h-screen bg-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : (
            "No hay datos disponibles para el período."
          )}
        </div>
      )}

      {chartData &&
        Array.isArray(chartData.maintenances_per_level) &&
        chartData.maintenances_per_level.length > 0 && (
          <div className="rounded-2xl p-4 md:p-7 md:pb-10  min-h-[300px] relative  neuphormism hover:shadow-none">
            <h2 className="text-xl font-bold mb-4 opacity-65">
              Mantenimientos por nivel
            </h2>
            <PieChart data={chartData.maintenances_per_level} />
          </div>
        )}
    </div>
  );
}
