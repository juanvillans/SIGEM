import { IconButton, TextField, Autocomplete, MenuItem } from "@mui/material";
import React from "react";
import SummarizeIcon from '@mui/icons-material/Summarize';


const CustomToolbar = () => {
    const handleClick = () => {
      console.log("clicked on icon!");
    };
  
    return (
      <React.Fragment>
          <IconButton className="iconButton" onClick={handleClick}>
            <SummarizeIcon className="deleteIcon" />
          </IconButton>
      </React.Fragment>
    );
  };
  
  export default CustomToolbar;