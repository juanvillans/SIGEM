import Add from "@mui/icons-material/Add";

export default function Button3D(props) {
  let icon = ''
    switch (props.icon) {
      case 'add':
        icon = <Add />
        break;
    
      default:
        break;
    }
  
  return (  
    <button className={`pushable text-sm  ${props?.color} ${props?.className} mb-4`} onClick={()=> props?.fClick()} type={props?.type} disabled={props?.disabled}>
      <span className="edge"></span>
      <span className="front">{icon} {props.text}</span>
    </button>
  );
}
