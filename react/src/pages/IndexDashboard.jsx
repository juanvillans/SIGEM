import React, { useEffect, useState, useMemo } from "react";
import axios from "../api/axios";
import { ResponsivePie } from "@nivo/pie";

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

export default function IndexDashboard() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchChartData() {
    setLoading(true);
    try {
      const res = await axios.get("/dashboard/statistics");
      console.log(res.data);
      setChartData(res.data);
    } catch (e) {
      console.error("Failed to fetch chart data", e);
    }
    setLoading(false);
  }
  useEffect(() => {
    fetchChartData();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-10 lg:px-10 pt-10 lg:pt-16">
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
