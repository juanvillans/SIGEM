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
import ExpandRowInventory from "../components/expandRowInventory";
import Alert from "../components/Alert";
import Input from "../components/Input";
import CircularProgress from "@mui/material/CircularProgress";
import RunningWithErrorsIcon from "@mui/icons-material/RunningWithErrors";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InventoryReport from "../components/InventoryReport";
import CheckIcon from "@mui/icons-material/Check";

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
};
let filterObject = {};
const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const days = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31,
];
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
    document.title = "SISMED | Inventario";
  }, []);

  // 559 573 719 724
  const [dataTable, setDataTable] = useState([]);
  const [generalData, setGeneralData] = useState({
    types_maintenance: [],
    organizations: [],
  });

  console.log(generalData);
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
      name: "entity_name",
      label: "Entidad",
      options: {
        display:
          parametersURL?.filterObject?.entity_code == "&entries[entity_code]=*"
            ? "true"
            : "excluded",
        filter: false,
        sort: true,
      },
    },
  
    {
      name: "product_name",
      label: "Equipo",
      options: {
        filter: false,
      },
    },
    {
      name: "product_brand",
      label: "Marca",
      options: {
        filter: false,
      },
    },
    {
      name: "product_model",
      label: "Modelo",
      options: {
        filter: false,
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
        filter: false,
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
    selectToolbarPlacement: 'above',
    rowsExpanded: [],
    rowsSelected: [],
    print: false,
    rowsPerPage: parametersURL.rowsPerPage,
    page: parametersURL.page - 1,
    serverSide: true,
    viewColumns: false,

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
          <IconButton
            onClick={() => {
              setTypeOfReport("EXCEL");
              setReportData([]);
              setOpen(true);
              getData(true);
            }}
            title="Generar reporte Excel"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 512 512"
            >
              <path
                fill="currentColor"
                d="M453.547 273.449H372.12v-40.714h81.427zm0 23.264H372.12v40.714h81.427zm0-191.934H372.12v40.713h81.427zm0 63.978H372.12v40.713h81.427zm0 191.934H372.12v40.714h81.427zm56.242 80.264c-2.326 12.098-16.867 12.388-26.58 12.796H302.326v52.345h-36.119L0 459.566V52.492L267.778 5.904h34.548v46.355h174.66c9.83.407 20.648-.291 29.197 5.583c5.991 8.608 5.41 19.543 5.817 29.43l-.233 302.791c-.29 16.925 1.57 34.2-1.978 50.892m-296.51-91.256c-16.052-32.57-32.395-64.909-48.39-97.48c15.82-31.698 31.408-63.512 46.937-95.327c-13.203.64-26.406 1.454-39.55 2.385c-9.83 23.904-21.288 47.169-28.965 71.888c-7.154-23.323-16.634-45.774-25.3-68.515c-12.796.698-25.592 1.454-38.387 2.21c13.493 29.78 27.86 59.15 40.946 89.104c-15.413 29.081-29.837 58.57-44.785 87.825c12.737.523 25.475 1.047 38.212 1.221c9.074-23.148 20.357-45.424 28.267-69.038c7.096 25.359 19.135 48.798 29.023 73.051c14.017.99 27.976 1.862 41.993 2.676M484.26 79.882H302.326v24.897h46.53v40.713h-46.53v23.265h46.53v40.713h-46.53v23.265h46.53v40.714h-46.53v23.264h46.53v40.714h-46.53v23.264h46.53v40.714h-46.53v26.897H484.26z"
              />
            </svg>
          </IconButton>
        </>
      );
    },
    onChangePage: (currentPage) => {
      setParametersURL((prev) => ({ ...prev, page: currentPage + 1 }));
    },

    onChangeRowsPerPage: (numberOfRows) => {
      setParametersURL((prev) => ({ ...prev, rowsPerPage: numberOfRows, page:  (totalData / numberOfRows ) < prev.page ? 1 : prev.page }));
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
        console.log({changedColumn, columnIndex});
        if (changedColumn == "last_type_maintenance_name") {
          arrValues = arrValues.map((eachValue) => {
            const typeMaintenanceObject = generalData.types_maintenance.find(
              (obj) => obj.name == eachValue
            );
            return typeMaintenanceObject ? typeMaintenanceObject.id : null;
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
        setGeneralData({ ...res, inventories: "" });
      }
      if (isJustForReport == false) {
        setDataTable(res.inventories);
      } else {
        setReportData(res.inventories);
      }
      setIsLoading(false);
      setRelation(false);
    });
  };
  useEffect(() => {
      if (!hasLoadedRelations) {
        axios.get(`/dashboard/relation?entities=true&machine_status=true&types_maintenance=true`)
          .then((res) => {
            if (res.data.entities) {
              const entitiesObject = {};
              res.data.entities.forEach((obj) => {
                entitiesObject[obj.name] = obj.name;
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
    console.log({generalData});
  const [tabla, setTabla] = useState();
  useEffect(() => {
    setTabla(
      <MUIDataTable
        isRowSelectable={true}
        title={
          <div>
            <div className="flex flex-col md:flex-row gap-3 min-h-[55px]  pt-3">
              <h1 className="text-grey md:text-xl relative top-1 ">
                Inventario  {props.userData.entityCode == 1 && "de"}
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
                <p>Generando reporte de {totalData} registros</p>
              </div>
            )}

            {reportData.length > 1 && typeOfReport === "PDF" && (
              <PDFDownloadLink
                fileName={`Reporte_inventario_${
                  new Date().toISOString().split("T")[0]
                }`}
                document={<InventoryReport products={reportData} />}
              >
                {({ blob, url, loading, error }) =>
                  loading ? (
                    "Casi listo..."
                  ) : (
                    <button className="border border-green text-green py-2 px-3 hover:bg-green hover:text-white text-center rounded w-full">
                      <span className="font-bold ml-3">
                        Descargar PDF de {totalData} registros
                      </span>
                    </button>
                  )
                }
              </PDFDownloadLink>
            )}

            {reportData.length > 1 && typeOfReport === "EXCEL" && (
              <button
                onClick={() => {
                  exportToExcel(
                    reportData,
                    `Reporte_inventario_${
                      new Date().toISOString().split("T")[0]
                    }`
                  );
                }}
                className="border border-green text-green py-2 px-3 hover:bg-green hover:text-white text-center rounded w-full"
              >
                <span className="font-bold ml-3">
                  Descargar Excel de {totalData} registros
                </span>
              </button>
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
