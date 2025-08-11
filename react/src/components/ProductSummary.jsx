const levels = {BAJO:{value: "low", label: "Bajo", color:"#027353"}, MEDIO:{value: "medium", label: "Medio", color:"#b65200"}, ALTO:{value: "high", label: "Alto", color:"#BF0404"}};

export default function ProductSummary({product}) {
  return (
    product && (
      <div className="flex gap-1 flex-wrap items-center">
        <b >{product?.machine || product?.name}</b>
        <span className="text-blue2 font-semibold">{product.brand}</span>
        <small className="text-grey font-bold">{product.model}</small>
        <span style={{backgroundColor: levels[product.level]?.color}} title={levels[product.level]?.label} className={`rounded-full px-1 text-white font-bold text-sm`}>{levels[product.level]?.label[0].toUpperCase() }</span> 
      </div>
    )
  );
}
