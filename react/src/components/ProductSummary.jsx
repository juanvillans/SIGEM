const levels = {low:{value: "low", label: "Bajo", color:"green"}, medium:{value: "medium", label: "Medio", color:"yellow"}, high:{value: "high", label: "Alto", color:"red"}};

export default function ProductSummary({product}) {
  return (
      <div className="flex gap-1 flex-wrap">
        <b >{product.name}</b>
        <span className="text-blue2 font-semibold">{product.brand}</span>
        <small className="text-grey font-bold">{product.model}</small>
        <span className={`rounded-full bg-${levels[product.level]?.color}`}></span> {levels[product.level]?.label[0].toUpperCase() }
      </div>
  );
}
