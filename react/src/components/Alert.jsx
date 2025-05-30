import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useState, useEffect } from "react";

export default function Alert(props) {
  const [timeoutId, setTimeoutId] = useState(null);

  let icon;
  let bgColor;

  if (props.status === 'Exito') {
    icon = <CheckCircleIcon />;
    bgColor = '#027353';
  } else if (props.status === 'Error') {
    icon = <ErrorIcon />;
    bgColor = '#8f0000';
  }

  const classes = props.open ? 'opacity-1 right-3' : 'opacity-0 -right-[300px]';

  useEffect(() => {
    if (props.open) {
      const id = setTimeout(() => {
        props.setAlert({ open: false, message: '', status: '' });
      }, 5000);
      setTimeoutId(id);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [props.open, props.setAlert]);

  const handleMouseEnter = () => {
    clearTimeout(timeoutId);
  };

  const handleMouseLeave = () => {
    if (props.open) {
      const id = setTimeout(() => {
        props.setAlert({ open: false, message: '', status: '' });
      }, 7000);
      setTimeoutId(id);
    }
  };

  return (
    <div
      className={`px-5 py-3 w-72 z-50 duration-500 text-white rounded-md fixed top-3 ${classes}`}
      style={{ background: bgColor, zIndex: '1000' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex gap-4 relative">
        {icon}
        <div>
          <b className="relative top-0.5">{props.status} en la operación!</b>
          <p className="text-sm">{props.message == undefined && props.status == "Exito" ? "Operación exitosa" : props.message}</p>
        </div>
      <button onClick={()=> props.setAlert({ open: false, message: '', status: '' })} className='hover:bg-white  hover:font-bold hover:bg-opacity-10 absolute -right-4 -top-2 px-3'>x</button>
      </div>

    </div>
  );
}
