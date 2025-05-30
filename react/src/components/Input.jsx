import { TextField } from "@mui/material";
import { memo } from "react";
// import { styled } from "@mui/material/styles";

// const WhiteCssTextField = styled(TextField)({
//   "& label": {
//     color: "#ffffffd7",
//     fontWeight: 500,
//   },
//   "& label.Mui-focused": {
//     color: "#ffffff",
//     fontWeight: 500,
//   },
//   "& .MuiOutlinedInput-root": {
//     "& .MuiOutlinedInput-notchedOutline": {
//       borderColor: "#ffffff",
//     },
//     "&:hover .MuiOutlinedInput-notchedOutline": {
//       borderColor: "#ffffffd7",
//     },
//     "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//       borderColor: "#ffffff",
//     },
//     color: "#ffffff",
//     "&::placeholder": {
//       color: "#ffffff",
//     },
//     "&.Mui-focused fieldset": {
//       borderColor: "#ffffff",
//     },
//     "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//       borderColor: "#ffffff",
//     },
//   },
// });
const Input = memo((props) => {
  return (
    <>
   
        <TextField
          variant="outlined"
          label={props.label}
          onChange={(e) => props?.onChange(e)}
          {...props}
          ref={props.Ref}
          value={props.value}
          shrink={`${props.shrink}`}
          name={props.name}
          sx={{ width: props.width || "100%", borderColor: "#069DBF", zIndex: 0 }}
          type={props.type}
          inputProps={{
            readOnly: props.readOnly,
            minLength: props.minLength,
            maxLength: props.maxLength,
            min:props.min
          }}

          InputLabelProps={{ shrink: props.shrink }}
          required={props.required || false}
          className={props.className}
        />
      {/* )} */}
    </>
  );
});

export default Input;