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
    typePresentations: [],
    TypeAdministrations: [],
    categories: [],
    Medicaments: [],
    organizations: [],
  });

  const [open, setOpen] = useState(false);
  const [modalConfirm, setModalConfirm] = useState({
    isOpen: false,
    modalInfo: false,
  });
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
      name: "entityName",
      label: "Entidad",
      options: {
        display:
          parametersURL.filterObjectValues.entityCode ==
          "&inventories[entityCode]=*"
            ? "true"
            : "excluded",
        filter: false,
        sort: true,
      },
    },
    {
      name: "code",
      label: "Cód",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "name",
      label: "producto",
      options: {
        filter: false,
        customBodyRenderLite: (value, tableMeta) => {
          const rowData = dataTable[tableMeta];
          return (
            <p>
              <b> {rowData.name}</b> {rowData.unitPerPackage > 1 ? <span className="text-green font-semibold">{rowData.unitPerPackage}<small>x</small> </span> : <span>{rowData.unitPerPackage}</span>}{" "}
              {rowData.typePresentationName != "N/A" &&
                rowData.typePresentationName}{" "}
              {rowData.concentrationSize != "N/A" && (
                <b style={{ color: "#187CBA" }}> {rowData.concentrationSize}</b>
              )}
            </p>
          );
        },
      },
    },
    {
      name: "stock",
      label: "Total",
      options: {
        filter: false,
        customBodyRender: (stock, tableMeta) => {
          return <p className=" font-bold">{stock}</p>;
        },
      },
    },
    {
      name: "stockPerExpire",
      label: "Por vencer",
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          if (value > 0) {
            return (
              <span className=" bg-blue3 text-red font-bold p-1 px-2 rounded">
                {value} <RunningWithErrorsIcon className="relative -top-1 " />
              </span>
            );
          } else {
            return <span className="">{value}</span>;
          }
        },
      },
    },
    {
      name: "stockGood",
      label: "Buen estado",
      options: {
        filter: false,

        customBodyRender: (stock, tableMeta) => {
          const minimumAlert = dataTable[tableMeta.rowIndex].minimumAlert;

          if (minimumAlert) {
            return (
              <span className="flex">
                <span className="text-blue1 p-1 px-2 rounded font-bold  bg-blue3">
                  {stock}
                </span>
                <ErrorOutlineIcon className="relative text-red -top-1.5" />
              </span>
            );
          } else {
            return (
              <span className="text-blue1 p-1 px-2 rounded font-bold bg-blue3">
                {stock}
              </span>
            );
          }
        },
      },
    },
    {
      name: "categoryName",
      label: "Categoria",
      options: {
        display: "excluded",
        filter: true,
        filterList: parametersURL?.filterList[6] || [],
        sort: true,
        filterOptions: {
          names: generalData.categories
            ? generalData.categories.map((ent) => ent.name)
            : [""],
        },
      },
    },
    {
      name: "typePresentationName",
      label: "Presentación",
      options: {
        display: "excluded",

        filter: true,
        filterList: parametersURL?.filterList[7] || [],
        sort: true,
        filterOptions: {
          names: generalData.typePresentations
            ? generalData.typePresentations.map((ent) => ent.name)
            : [""],
        },
      },
    },

    {
      name: "unitPerPackage",
      label: "Unidades x envase",
      options: {
        display: "excluded",

        filter: false,
      },
    },
    {
      name: "concentrationSize",
      label: "Concentración / tamaño",
      options: {
        display: "excluded",
        filter: false,
      },
    },

    {
      name: "typeAdministrationName",
      label: "Administración",
      options: {
        display: "excluded",
        filter: true,
        filterList: parametersURL?.filterList[10] || [],
        sort: true,
        filterOptions: {
          names: generalData.typeAdministrations
            ? generalData.typeAdministrations.map((ent) => ent.name)
            : [""],
        },
      },
    },
    {
      name: "medicamentName",
      label: "Tipo de medicamento",
      options: {
        display: "excluded",
        filter: true,
        filterList: parametersURL?.filterList[11] || [],
        sort: true,
        filterOptions: {
          names: generalData.medicaments
            ? generalData.medicaments.map((ent) => ent.name)
            : [""],
        },
      },
    },

    {
      name: "stockExpired",
      label: "Vencidos",
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          if (value > 0) {
            return (
              <span className=" bg-red text-white font-bold p-1 px-2 rounded">
                {value}
              </span>
            );
          } else {
            return <span className="">{value}</span>;
          }
        },
      },
    },
    {
      name: "stockBad",
      label: "Defectuosos",
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          if (value > 0) {
            return (
              <span className=" bg-orange text-white font-bold p-1 px-2 rounded">
                {value}
              </span>
            );
          } else {
            return <span className="">{value}</span>;
          }
        },
      },
    },
    {
      name: "entries",
      label: "Entradas",
      options: {
        filter: false,
      },
    },

    {
      name: "outputs",
      label: "Salidas",
      options: {
        filter: false,
      },
    },
    {
      name: "entityCode",
      label: "Condición",
      options: {
        display: "excluded",
        filter: true,
        // filterType: "singleSelect",

        filterList: parametersURL?.filterList[16] || [],
        sort: false,
        filterOptions: {
          names: generalData.conditions
            ? generalData.conditions.map((ent) => ent.name)
            : [""],
        },
      },
    },
    {
      name: "minimunAlert",
      label: "Cantidad",
      options: {
        display: "excluded",
        filter: true,
        filterList: parametersURL?.filterList[17] || [],
        sort: false,
        filterOptions: {
          names: ["Crítica", "Suficiente"],
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
        if (changedColumn == "minimunAlert") {
          filterObject[changedColumn] = `${
            filterConfiguration[changedColumn]
          }${encodeURIComponent(
            arrValues
              .map((eachValue) => (eachValue == "Crítica" ? 1 : 0))
              .join()
              .replaceAll(",", "[OR]")
          )}`;
        } else if (changedColumn == "conditionName") {
          arrValues = arrValues.map((eachValue) => {
            eachValue = eachValue.toUpperCase();
            if (eachValue == "POR VENCER") return "stockPerExpire";
            if (eachValue == "BUEN ESTADO") return "stockGood";
            if (eachValue == "DEFECTUOSO") return "stockBad";
            if (eachValue == "VENCIDO") return "stockExpired";
          });

          delete filterObject["stockPerExpire"];
          delete filterObject["stockGood"];
          delete filterObject["stockBad"];
          delete filterObject["stockExpired"];
          filterObject[arrValues[arrValues.length - 1]] = `&inventories[${
            arrValues[arrValues.length - 1]
          }]=0`;
        } else {
          // if (arrValues.some(eachValue => eachValue == "Crítica" || eachValue == ))
          filterObject[changedColumn] = `${
            filterConfiguration[changedColumn]
          }${encodeURIComponent(arrValues.join().replaceAll(",", "[OR]"))}`;
        }
      } else {
        if (changedColumn == "conditionName") {
          delete filterObject["stockPerExpire"];
          delete filterObject["stockGood"];
          delete filterObject["stockBad"];
          delete filterObject["stockExpired"];
        }
        delete filterObject[changedColumn]; // Elimina la propiedad del objeto si no hay valores seleccionados
      }

      // setFilterObject(newFilterObject); // Actualiza el objeto de filtro
      setParametersURL((prev) => ({
        ...prev,
        filter: Object.values(filterObject).join(""),
        page: 1,
        filterList,
        filterObject,
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
    expandableRowsHeader: false,
    expandableRowsOnClick: true,
    expandableRows: true,
    onRowExpansionChange: (
      currentRowsExpanded,
      allRowsExpanded,
      rowsExpanded
    ) => {
      const product = dataTable[currentRowsExpanded[0].dataIndex];
      // console.log(product)
      // setDataTable(prev => [...prev])
      // detailInventory(product.productId , product.entityCode, currentRowsExpanded[0].dataIndex)
    },
    renderExpandableRow: (rowData, rowMeta) => {
      const product = dataTable[rowMeta.dataIndex];
      // detailInventory(product.productId , product.entityCode, rowMeta.dataIndex)
      return (
        <ExpandRowInventory
          productId={product.productId}
          entityCode={product.entityCode}
          indx={rowMeta.dataIndex}
        />
      );
    },
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
  }, [dataTable]);

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
