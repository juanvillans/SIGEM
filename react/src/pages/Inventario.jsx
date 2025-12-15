import React, { useEffect, useState, useCallback, useRef } from "react";
// import "../css/basics.css";

import MUIDataTable from "mui-datatables";

import axios from "../api/axios";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

// import Chip from '@material-ui/core/Chip';
import { IconButton, MenuItem } from "@mui/material";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfimModal";
import Alert from "../components/Alert";
import Input from "../components/Input";
import CircularProgress from "@mui/material/CircularProgress";
import RunningWithErrorsIcon from "@mui/icons-material/RunningWithErrors";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InventoryReport from "../components/InventoryReport";
import CheckIcon from "@mui/icons-material/Check";
import ProductSummary from "../components/ProductSummary";
import { useReactToPrint } from 'react-to-print';

// import { NavLink } from "react-router-dom";
import * as XLSX from "xlsx";
// import { NavLink } from "react-router-dom";
import useDebounce from "../components/useDebounce";

const filterConfiguration = {
  conditionName: "&condition[name]=",
  categoryName: "&category[name]=",
  typeAdministrationName: "&typeAdministration[name]=",
  typePresentationName: "&typePresentation[name]=",
  organizationName: "&organization[name]=",
  medicamentName: "&medicament[name]=",
  day: "&inventories[day]=",
  month: "&inventories[month]=",
  year: "&inventories[year]=",
  minimunAlert: "&inventories[minimumAlert]=",
  last_type_maintenance_name: "&inventories[last_type_maintenance_id]=",
  machine_status_name: "&inventories[machine_status_id]=",
};
let filterObject = {};

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}



export default function Inventario(props) {
  let arrStatusProducts = [
    { id: 1, name: "Buen estado" },
    { id: 2, name: "Vencido" },
    { id: 3, name: "Defectuoso" },
  ];
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "SIGEM | Inventario";
  }, []);

  // 559 573 719 724
  const [dataTable, setDataTable] = useState([]);
  const [generalData, setGeneralData] = useState({
    types_maintenance: [],
    organizations: [],
    entitiesObject: {},
    machine_status: [],
    entities: [],
  });

  const [open, setOpen] = useState(false);
  const [modalConfirm, setModalConfirm] = useState({
    isOpen: false,
    modalInfo: false,
  });
  const [hasLoadedRelations, setHasLoadedRelations] = useState(false);

  const [reportData, setReportData] = useState([]);

  const [relation, setRelation] = useState(true);
  const [parametersURL, setParametersURL] = useState({
    page: 1,
    rowsPerPage: 25,
    search: "",
    orderBy: "",
    orderDirection: "",
    filter: "",
    total: 0,
    filterList: [],
    filterObjectValues: { entityCode: props.userData.entityCode },
  });

  const columns = [
 

    {
      name: "productObj",
      label: "Equipo",
      options: {
        filter: false,
        customBodyRender: (value) => {
          return <ProductSummary product={value} />;
        },
      },
    },
      {
      name: "entity_name",
      label: "Entidad",
      options: {
        display:  "false",  
        filter: false,
        sort: false,
      },
    },
    {
      name: "serial_number",
      label: "Serial",
      options: {
        filter: false,
      },
    },
    {
      name: "national_code",
      label: "Bien Nacional",
      options: {
        filter: false,
      },
    },
    {
      name: "machine_status_name",
      label: "Estado",
      options: {
        filter: true,
        filterList: parametersURL?.filterList[6] || [],
        filterOptions: {
          names: generalData?.machine_status?.map((obj) => obj.name),
        },
      },
    },
    {
      name: "components",
      label: "Componentes",
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          // Si no hay componentes o el objeto está vacío
          if (!value || Object.keys(value).length === 0) return "N/A";

          // Convertir el objeto en un array de componentes FALTANTES (false)
          const missingComponents = Object.entries(value)
            .filter(([_, isIncluded]) => !isIncluded) // Filtra los que tienen false
            .map(([component]) => component); // Extrae solo el nombre

          // Caso 1: No hay componentes faltantes
          if (missingComponents.length === 0) {
            return (
              <span className="text-white p-auto font-bold text-xs px-2 py-1 rounded bg-green">
                Incluidos
                <CheckIcon className="pb-1"></CheckIcon>
              </span>
            );
          }

          // Caso 2: Hay componentes faltantes
          return (
            <div className="relative group">
              <div className="flex flex-wrap gap-1 max-w-[300px]">
                {/* Mostrar los primeros 3 faltantes (color amarillo) */}
                <p className="text-xs py-1 ">Faltan:</p>
                {missingComponents.slice(0, 3).map((comp, i) => (
                  <span
                    key={i}
                    className="bg-orange text-white text-center text-xs px-2 py-1 rounded"
                  >
                    {comp}
                  </span>
                ))}

                {/* Botón "Más" si hay más de 3 faltantes */}
                {missingComponents.length > 3 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      document
                        .getElementById(
                          `missing-components-${tableMeta.rowIndex}`
                        )
                        .classList.toggle("hidden");
                    }}
                    className="text-xs p-1 rounded border border-gray-300 text-grey"
                  >
                    +{missingComponents.length - 3} faltantes
                  </button>
                )}
              </div>

              {/* Popup con TODOS los faltantes (solo visible al hacer clic) */}
              <div
                id={`missing-components-${tableMeta.rowIndex}`}
                className="hidden absolute z-10 mt-1 w-64 bg-white shadow-lg rounded-md p-2 border border-grey"
              >
                <div className="flex flex-wrap gap-1">
                  {missingComponents.map((comp, i) => (
                    <span
                      key={i}
                      className="bg-orange text-white text-xs px-2 py-1 rounded mb-1"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        },
      },
    },
    {
      name: "last_type_maintenance_name",
      label: "Último tipo de mantenimiento",
      options: {
        filter: true,
        filterList: parametersURL?.filterList[8] || [],
        filterOptions: {
          names: generalData?.types_maintenance?.map((obj) => obj.name),
        },
      },
    },
  ];

  // console.log(NewRegister);
  const [totalData, setTotalData] = useState(0);
  // const [filterObject, setFilterObject] = useState({})

  const handleSearch = useDebounce((searchText) => {
    // Perform search operation with the debounced term
    setParametersURL((prev) => ({ ...prev, search: searchText, page: 1 }));
  }, 400);
  useEffect(() => {
    setDataTable([]);
    setIsLoading(true);
    getData();
  }, [parametersURL]);

  const [typeOfReport, setTypeOfReport] = useState("PDF");
  // const [rowSelected, setRowSelected] = useState([])
  const exportToExcel = (data, fileName) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const options = {
    rowsPerPageText: "Filas por pagina",
    download: false,

    count: totalData,
    selectToolbarPlacement: "above",
    rowsExpanded: [],
    rowsSelected: [],
    print: false,
    rowsPerPage: parametersURL.rowsPerPage,
    page: parametersURL.page - 1,
    serverSide: true,

    customToolbar: () => {
      return (
        <>
          <IconButton
            className="iconButton"
            onClick={() => {
              setTypeOfReport("PDF");
              setReportData([]);
              setOpen(true);
              getData(true);
            }}
            title="Generar reporte PDF"
          >
            <PictureAsPdfIcon className="deleteIcon" />
          </IconButton>
    
        </>
      );
    },
    onChangePage: (currentPage) => {
      setParametersURL((prev) => ({ ...prev, page: currentPage + 1 }));
    },

    onChangeRowsPerPage: (numberOfRows) => {
      setParametersURL((prev) => ({
        ...prev,
        rowsPerPage: numberOfRows,
        page: totalData / numberOfRows < prev.page ? 1 : prev.page,
      }));
    },

    onFilterChange: (
      changedColumn,
      filterList,
      typeFilter,
      columnIndex,
      displayData
    ) => {
      let arrValues = filterList[columnIndex];
      // let newFilterObject = { ...filterObject }; // Copia el objeto de filtro actual
      // let copyText= textFilterUrl
      if (typeFilter == "reset") {
        setParametersURL((prev) => ({ ...prev, filter: [], filterList: [] }));
        return;
      }
      if (arrValues.length > 0) {
        console.log({ changedColumn, columnIndex });
        if (changedColumn == "last_type_maintenance_name") {
          arrValues = arrValues.map((eachValue) => {
            const typeMaintenanceObject = generalData.types_maintenance.find(
              (obj) => obj.name == eachValue
            );
            return typeMaintenanceObject ? typeMaintenanceObject.id : null;
          });
        }
        if (changedColumn == "machine_status_name") {
          arrValues = arrValues.map((eachValue) => {
            const machineStatusObject = generalData.machine_status.find(
              (obj) => obj.name == eachValue
            );
            return machineStatusObject ? machineStatusObject.id : null;
          });
        }
        filterObject[changedColumn] = `${
          filterConfiguration[changedColumn]
        }${encodeURIComponent(arrValues.join().replaceAll(",", "[OR]"))}`;
      } else {
        delete filterObject[changedColumn]; // Elimina la propiedad del objeto si no hay valores seleccionados
      }

      setParametersURL((prev) => ({
        ...prev,
        filter: Object.values(filterObject).join(""),
        page: 1,
        filterList,
      }));
    },

    onSearchChange: (searchText) => {
      handleSearch(searchText);
    },

    onColumnSortChange: (changedColumn, direction) => {
      setParametersURL((prev) => ({
        ...prev,
        orderBy: changedColumn,
        orderDirection: direction,
      }));
    },
    filterType: "multiselect",
    // selectableRowsOnClick: true,
    selectableRowsHideCheckboxes: true,
    // selectableRows: "single",
    fixedHeader: true,
    textLabels: {
      body: {
        noMatch: isLoading ? (
          <CircularProgress color="inherit" size={33} />
        ) : (
          "No se han encontrado datos"
        ),
      },
      pagination: {
        next: "Siguiente página",
        previous: "Anterior página",
        rowsPerPage: "Filas por pág",
        displayRows: "of",
      },
      toolbar: {
        search: "Buscar",
        viewColumns: "Ver Columnas",
        filterTable: "Filtrar Tabla",
      },
      filter: {
        all: "Todos",
        title: "FILTROS",
        reset: "RESETEAR",
      },
      viewColumns: {
        title: "Mostrar Columnas",
        titleAria: "Mostrar/Ocultar Columnas de la Tabla",
      },
      selectedRows: {
        text: "fila seleccionada",
        delete: "Eliminar",
        deleteAria: "Eliminar Filas Seleccionadas",
      },
    },

    tableBodyMaxHeight: "68vh",
    // count: 2,

    // customSearchRender: debounceSearchRender(500),
    rowsPerPageOptions: [10, 25, 50, 100],
  };

  const getData = async (isJustForReport = false) => {
    let url = `dashboard/inventories?entity=${parametersURL.filterObjectValues.entityCode}&relation=${relation}&report=${isJustForReport}`;
    url += `&page=${parametersURL.page}`;
    if (isJustForReport === true) {
      url += `&rowsPerPage=${totalData}`;
    } else {
      url += `&rowsPerPage=${parametersURL?.rowsPerPage}`;
    }
    if (parametersURL.search) {
      url += `&search[all]=${parametersURL.search}`;
    }
    if (parametersURL.filter.length > 0) {
      url += `${parametersURL.filter}`;
    }
    if (parametersURL.orderBy.length > 0) {
      url += `&orderBy=${parametersURL.orderBy}&orderDirection=${parametersURL.orderDirection}`;
    }
    await axios.get(url).then((response) => {
      setIsLoading(true);
      // if (isJustForReport) {

      // }
      const res = response.data;
      // console.log(response.data);
      // console.log(res);
      setTotalData(res.total);

      // console.log(response.data.products)
      // console.log(response.data.typePresentation)
      if (relation == true) {
        // setGeneralData({ ...res, inventories: "" });
      } else if (isJustForReport == true) {
        console.log({res});
        setReportData(res.inventories);
      }
      if (isJustForReport == false) {
        setDataTable(res.inventories);
      }
      setIsLoading(false);
      setRelation(false);
    });
  };
  useEffect(() => {
    if (!hasLoadedRelations) {
      axios
        .get(
          `/dashboard/relation?entities=true&machine_status=true&types_maintenance=true`
        )
        .then((res) => {
          if (res.data.entities) {
            const entitiesObject = {};
            res.data.entities.forEach((obj) => {
              entitiesObject[obj.code] = obj.name;
            });
            setGeneralData((prev) => ({
              ...prev,
              entitiesObject,
              entities: res.data.entities,
              machine_status: res.data.machine_status,
              types_maintenance: res.data.types_maintenance,
              // conditions: res.data.conditions || prev.conditions,
            }));
          }
          setHasLoadedRelations(true);
        })
        .catch((err) => {
          console.error("Error al cargar datos relacionados:", err);
        });
    }
  }, [hasLoadedRelations, parametersURL.filterObjectValues.entityCode]);


  const [tabla, setTabla] = useState();
  useEffect(() => {
    setTabla(
      <MUIDataTable
        isRowSelectable={true}
        title={
          <div>
            <div className="flex flex-col md:flex-row gap-3 min-h-[55px]  pt-3">
              <h1 className="text-grey md:text-xl relative top-1 ">
                Inventario {props.userData.entityCode == 1 && "de"}
              </h1>
              {props.userData.entityCode == 1 && (
                <span className="relative -top-2">
                  <Input
                    name="user_type"
                    id=""
                    select
                    value={parametersURL.filterObjectValues.entityCode}
                    // value={props.userData.entityCode}
                    size="small"
                    className=" bg-blue/0 py-1 font-bold"
                    onChange={(e) => {
                      filterObject[
                        "entityCode"
                      ] = `&inventories[entityCode]=${e.target.value}`;
                      setParametersURL((prev) => ({
                        ...prev,
                        filter: Object.values(filterObject).join(""),
                        page: 1,
                        filterObjectValues: {
                          ...prev.filterObjectValues,
                          entityCode: e.target.value,
                        },
                        filterObject,
                      }));
                    }}
                    // value={user_type_selected}
                  >
                    {generalData.entities?.map((option) => (
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
          </div>
        }
        data={dataTable}
        columns={columns}
        options={options}
      />
    );
  }, [dataTable, generalData]);


  const [modalReport, setModalReport] = useState();
  useEffect(() => {
    setModalReport(
      <Modal
        show={open}
        onClose={() => setOpen(false)}
        content={
          <>

            {reportData.length < 1 && (
              <div className="text-center">
                <CircularProgress color="inherit" size={33} />
                <p>Generando reporte...</p>
              </div>
            )}
            
            {reportData.length > 0 && typeOfReport === "PDF" && (
              <InventoryReport products={reportData} entityName={generalData.entitiesObject[parametersURL.filterObjectValues.entityCode]} />
            )}

        
          </>
        }
      ></Modal>
    );
  }, [reportData]);
  // console.log({ productsSearched });
  const [alert, setAlert] = useState({
    open: false,
    status: "",
    message: "",
  });

  return (
    <>
      {/* <PDFViewer
            style={{ width: "1000px", height: "800px" }}
            // filename={`guia-${infoBill.guide}-${infoBill.code}`}
          >
            <InventoryReport products={infoReport} />
          </PDFViewer> */}
      {/* <div className="mt-1 h-14 flex items-center underline text-blue1">
          <NavLink to={"/dashboard/AjusteDeInventario"} title={"Ajuste de inventario"}>
            Ajuste de inventario
        </NavLink>

      </div> */}
      <div className="mt-16"></div>
      {open && modalReport}

      {tabla}

      <Alert
        open={alert.open}
        setAlert={setAlert}
        status={alert.status}
        message={alert.message}
      />

      <ConfirmModal
        closeModal={() => {
          setModalConfirm({ isOpen: false });
          // setRowSelected([])
        }}
        modalInfo={modalConfirm.modalInfo}
        isOpen={modalConfirm.isOpen}
        aceptFunction={() => modalConfirm.aceptFunction()}
      />
    </>
  );
}
