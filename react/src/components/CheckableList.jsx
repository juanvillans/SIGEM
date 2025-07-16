import { memo } from "react";
import { Checkbox, FormGroup, FormControlLabel } from "@mui/material";

const CheckableList = memo(({ components, onComponentsChange }) => {
    const handleCheck = (componentName) => (event) => {
        const newComponents = {
            ...components,
            [componentName]: event.target.checked
        };
        onComponentsChange(newComponents);
    };

    return (
        <div className="bg-white relative rounded-lg shadow p-4 max-h-64 overflow-y-auto">
            {/* <h3 className="text-lg font-semibold text-gray-800 mb-3">Componentes requeridos</h3> */}
            <FormGroup className="space-y-0.5">
                {Object.keys(components).map((componentName) => (
                    <div key={componentName} className="flex items-center p-2 py-0.5 hover:bg-gray-50 rounded">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={components[componentName]}
                                    onChange={handleCheck(componentName)}
                                    color="primary"
                                />
                            }
                            label={
                                <span className="text-gray-700 capitalize">
                                    {componentName.toLowerCase()}
                                </span>
                            }
                            className="w-full m-0"
                        />
                    </div>
                ))}
            </FormGroup>
        </div>
    );
});

export default CheckableList;