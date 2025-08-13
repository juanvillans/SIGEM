import React, { useEffect, useState, useCallback, useRef } from "react";
// import "../css/basics.css";

import MUIDataTable from "mui-datatables";
import StoreIcon from "@mui/icons-material/Store";
import Button3D from "../components/Button3D";

import axios from "../api/axios";
import CheckIcon from "@mui/icons-material/Check";
import BlockIcon from "@mui/icons-material/Block";
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
// import Chip from '@material-ui/core/Chip';
import Input from "../components/Input";
import { IconButton, MenuItem } from "@mui/material";
import ConfirmModal from "../components/ConfimModal";
import Alert from "../components/Alert";
import ExpandRowProducts from "../components/ExpandRowProducts";
import CircularProgress from "@mui/material/CircularProgress";
// import { NavLink } from "react-router-dom";
import Modal from "../components/Modal";
import ProductSummary from "../components/ProductSummary";

import useDebounce from "../components/useDebounce";
// import { Suspense } from "react";
let tableSearchText = "";

const filterConfiguration = {
  conditionName: "&condition[name]=",
  categoryName: "&category[name]=",
  typeAdministrationName: "&typeAdministration[name]=",
  typePresentationName: "&typePresentation[name]=",
  medicamentName: "&medicament[name]=",
  organizationName: "&organization[name]=",
  day: "&entryToConfirm[day]=",
  month: "&entryToConfirm[month]=",
  year: "&entryToConfirm[year]=",
  status: "&entryToConfirm[status]=",
  entityCodeFrom: "&entityCodeFrom=",
};
let filterObject = {};

const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const days = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31,
];
const currentDate = new Date();
export default function Entradas(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [localStorageForm, setLocalStorageForm] = useState(false);
  const [transformToSend, setTransformToSend] = useState({});

  useEffect(() => {
    document.title = "SIGEM | Entradas por confirmar";

    if (localStorage.getItem("entryForm")) {
      setLocalStorageForm(JSON.parse(localStorage.getItem("entryForm")));
    }
  }, []);
  const [dataTable, setDataTable] = useState([]);
  const [generalData, setGeneralData] = useState({
    typePresentations: [],
    TypeAdministrations: [],
    categories: [],
    Medicaments: [],
    organizations: [],
    conditions: [],
    entities: [],
    entriesRequestStatus: [
      { name: "sin responder", id: "5" },
      { name: "confirmadas", id: "6" },
      { name: "rechazadas", id: "7" },
    ],
  });

  const [NewRegister, setNewRegister] = useState({
    products: [],
    id: null,
  });

  const [open, setOpen] = useState(false);
  const [modalConfirm, setModalConfirm] = useState({
    isOpen: false,
    modalInfo: false,
    content: <></>,
  });

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
    filterObjectValues: { status: "5" },
  });
  let selectedRowRquest = false;

  function handleSelectRow(row) {
    selectedRowRquest = row;
  }

  const columns = [
    {
      name: "day",
      label: "Dia",
      options: {
        display: "excluded",

        filter: true,
        filterList: parametersURL?.filterList[0] || [],

        filterOptions: {
          names: days,
        },
      },
    },
    {
      name: "month",
      label: "Mes",
      options: {
        display: "excluded",
        filter: true,
        filterList: parametersURL?.filterList[1] || [],

        filterOptions: {
          names: months,
        },
      },
    },
    {
      name: "year",
      label: "Año",
      options: {
        display: "excluded",
        filter: true,
        filterList: parametersURL?.filterList[2] || [],

        filterOptions: {
          names: generalData?.years,
        },
      },
    },
    {
      name: "entityName",
      label: "Entidad",
      options: {
        display:
          parametersURL?.filterObject?.entityCode == "&entries[entityCode]=*"
            ? "true"
            : "excluded",
        filter: false,
        sort: true,
      },
    },
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
      name: "departureDate",
      label: "F. De salida",
      options: {
        sort: false,
        filter: false,
        customBodyRender: (value) => {
          const [year, month, day] = value?.split("-") || "n/a";
          return (
            <p>
              {day}-{month}-{year}
            </p>
          );
        },
      },
    },

    {
      name: "departureTime",
      label: "Hora de salida",
      options: {
        filter: false,
      },
    },
    {
      name: "entityFromName",
      label: "Origen",
      options: {
        filter: true,
        sort: false,
        customBodyRender: (value) => {
          return (
            <div className="flex">
              <p>
                {" "}
                <span className="text-blue1">
                  <StoreIcon style={{ fontSize: "15px" }} />
                </span>{" "}
                {value}
              </p>
            </div>
          );
        },
        // filterList: parametersURL?.filterList[8] || [],
        // sort: true,
        filterType: "dropdown",
        filterOptions: {
          names: generalData.entities
            ? generalData.entities.map((ent) => {
                if (props.userData.entityCode != ent.code) {
                  return ent.name;
                } else {
                  return "";
                }
              })
            : [""],
        },
      },
    },
  ];

  const [organizations, setOrganizations] = useState([]);

  const [totalData, setTotalData] = useState(0);
  // const [filterObject, setFilterObject] = useState({})

  const handleSearch = useDebounce((searchText) => {
    // Perform search operation with the debounced term
    setParametersURL((prev) => ({ ...prev, search: searchText, page: 1 }));
  }, 400);
  useEffect(() => {
    setDataTable([]);
    setIsLoading(true);
    let url = `dashboard/entries-to-confirm?relation=${relation}`;
    url += `&page=${parametersURL.page}`;
    url += `&rowsPerPage=${parametersURL.rowsPerPage}`;

    if (parametersURL.search) {
      url += `&search[all]=${parametersURL.search}`;
    }
    if (parametersURL.filter.length > 0) {
      url += `${parametersURL.filter}`;
    }
    if (parametersURL.orderBy.length > 0) {
      url += `&orderBy=${parametersURL.orderBy}&orderDirection=${parametersURL.orderDirection}`;
    }
    getData(url);
    // url += `search?${parametersURL.search}`
  }, [parametersURL]);

  const handleRespond = async (selectedRows, type) => {
    const indx = selectedRows.data[0].dataIndex;
    const dataOfIndx = structuredClone(dataTable[indx]);
    if (
      !window.confirm(
        `¿Está seguro de ${type === "confirm" ? "Confirmarlo" : "Rechazarlo"}?`
      )
    ) {
      return;
    }
    try {
      await axios
        .post(`/dashboard/entries-to-confirm/${type}`, {
          entryToConfirmID: dataOfIndx.id,
        })
        .then((response) => {
          if (type == "confirm") {
            setAlert({
              open: true,
              status: "Exito",
              message: "Añadido al inventario",
            });
          } else {
            setAlert({
              open: true,
              status: "Exito",
              message: "Fue rechazado",
            });
          }
        });

      setParametersURL((prev) => ({
        ...prev,
        page: 1,
        search: "",
        orderBy: "",
        orderDirection: "",
        filter: `&entries-to-confirm[status]=${prev.filterObjectValues.status}`,
        filterObjectValues: { status: prev.filterObjectValues.status },
        filterObject,
        rowsPerPage: parametersURL.rowsPerPage,
        total: 0,
      }));
    } catch (error) {
      setAlert({
        open: true,
        status: "Error",
        message: error.response.data?.errors
          ? Object.values(error.response.data.errors)[0][0]
          : error.response?.data?.message || "Algo salió mal",
      });
    }
  };

  const handleTransform = async (selectedRows, type) => {
    const copySelectedRowRquest = structuredClone(selectedRowRquest);

    try {
      await axios
        .post(`/dashboard/entries-to-confirm/transform`, {
          entryToConfirmID: copySelectedRowRquest.id,
        })
        .then((response) => {
          let responseData = response.data.data;

          let newProductsUI = [];
          let newTransformedToSend = {};
          for (let i = 0; i < copySelectedRowRquest.products.length; i++) {
            const originalPr = copySelectedRowRquest.products[i];
            const responseProduct = responseData[i];

            if (originalPr.type_product == 2) {
              newProductsUI.push({ ...originalPr, itWasTransformed: null });
            } else if (responseProduct.new === null) {
              newProductsUI.push({ ...originalPr, itWasTransformed: false });
            } else {
              newProductsUI.push({
                ...responseProduct.new,
                quantity: originalPr.quantity * originalPr.unitPerPackage,
                loteNumber: originalPr.loteNumber,
                expirationDate: originalPr.expirationDate,
                description: originalPr.description,
                conditionId: originalPr.conditionId,
                itWasTransformed: true,
                entry_id: originalPr.entry_id,
              });
            }
          }
          setNewRegister({
            id: copySelectedRowRquest.id,
            products: newProductsUI,
          });

          // setNewRegister({products: response.data.data})
          setOpen(true);
        });
    } catch (error) {
      setAlert({
        open: true,
        status: "Error",
        message: error.response.data?.errors
          ? Object.values(error.response.data.errors)[0][0]
          : error.response?.data?.message || "Algo salió mal",
      });
    }
  };
  const handleTransformSave = async (e) => {
    e.preventDefault();

    if (!window.confirm(`¿Está seguro de Confirmarlo?`)) {
      return;
    }
    try {
      await axios
        .post(`/dashboard/entries-to-confirm/transform/confirm`, {
          entryToConfirmID: NewRegister.id,
          products: NewRegister.products,
        })

        .then((response) => {
          setAlert({
            open: true,
            status: "Exito",
            message: "Añadido al inventario",
          });

          setParametersURL((prev) => ({
            ...prev,
            page: 1,
            search: "",
            orderBy: "",
            orderDirection: "",
            filter: `&entries-to-confirm[status]=${prev.filterObjectValues.status}`,
            filterObjectValues: { status: prev.filterObjectValues.status },
            filterObject,
            rowsPerPage: parametersURL.rowsPerPage,
            total: 0,
          }));

          setOpen(false);
          setNewRegister({ products: [] });
        });
    } catch (error) {
      setAlert({
        open: true,
        status: "Error",
        message: error.response.data?.errors
          ? Object.values(error.response.data.errors)[0][0]
          : error.response?.data?.message || "Algo salió mal",
      });
    }
  };
  // const [rowSelected, setRowSelected] = useState([])
  const options = {
    download: false,
    count: totalData,
    selectToolbarPlacement: "above",
    rowsExpanded: [],
    rowsSelected: [],
    print: false,
    rowsPerPage: parametersURL.rowsPerPage,
    page: parametersURL.page - 1,
    serverSide: true,
    viewColumns: false,

    onChangePage: (currentPage) => {
      setParametersURL((prev) => ({ ...prev, page: currentPage + 1 }));
    },
    search: false,
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
        if (changedColumn == "entityFromName") {
          changedColumn = "entityCodeFrom";
          for (let i = 0; i < generalData.entities.length; i++) {
            const element = generalData.entities[i];
            if (element.name == arrValues[0]) {
              arrValues = [element.code];
              break;
            }
          }
        }
        if (changedColumn == "status") {
          arrValues = arrValues.map((eachValue) =>
            eachValue == "Recibidos" ? 1 : 2
          );
        }

        filterObject[changedColumn] = `${
          filterConfiguration[changedColumn]
        }${encodeURIComponent(arrValues.join().replaceAll(",", "[OR]"))}`;
      } else {
        delete filterObject[changedColumn]; // Elimina la propiedad del objeto si no hay valores seleccionados
      }

      // setFilterObject(newFilterObject); // Actualiza el objeto de filtro
      setParametersURL((prev) => ({
        ...prev,
        filter: Object.values(filterObject).join(""),
        page: 1,
        filterList,
      }));
    },

    onColumnSortChange: (changedColumn, direction) => {
      setParametersURL((prev) => ({
        ...prev,
        orderBy: changedColumn,
        orderDirection: direction,
        filterObject,
      }));
    },

    filterType: "multiselect",
    selectableRowsOnClick: true,
    onRowSelectionChange: () => {
      selectedRowRquest = false;
    },
    selectableRowsHideCheckboxes: true,
    selectableRows: "single",
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
    customToolbarSelect: (selectedRows, displayData, setSelectedRows) => {
      return (
        <div>
          {dataTable[selectedRows.data[0].dataIndex]?.status == 3 && (
            <>
              <IconButton
                title="Confirmar"
                onClick={
                  () => {
                    handleRespond(selectedRows, "confirm");

                  }
                }
              >
                <div className="border rounded border-blue2 text-blue2 px-3 text-sm font-bold">
                  <span className="mr-2">Confirmar</span>
                  <CheckIcon />
                </div>
              </IconButton>
              <IconButton
                title="Rechazar"
                onClick={() => {
                  handleRespond(selectedRows, "reject");
                }}
              >
                <div className="border rounded border-red text-red px-3 text-sm font-bold">
                  <span className="mr-2">Rechazar</span>
                  <BlockIcon />
                </div>
              </IconButton>
            </>
          )}
        </div>
      );
    },
    expandableRowsHeader: false,
    expandableRowsOnClick: false,
    expandableRows: false,
    renderExpandableRow: (rowData, rowMeta) => {
      const entry = dataTable[rowMeta.dataIndex];
      return (
        <ExpandRowProducts
          id={entry.id}
          entityCode={entry.entityCode}
          code={entry.outputCode}
          route={"entries-to-confirm"}
          data={entry}
          handleSelectRow={handleSelectRow}
          tableSearchText={tableSearchText}
        />
      );
    },
    setRowProps: (row, dataIndex, rowIndex) => {
      if (dataTable[dataIndex].status == "2") {
        return {
          style: {
            opacity: ".8",
            textDecoration: "line-through",
            background: "#f3f3f3",
            color: "red",
          },
        };
      }
    },
  };
  function editIconClick(selectedRows, submitText, isJustForCopy = false) {
    // const indx = selectedRows.data[0].dataIndex;
    const copySelectedRowRquest = structuredClone(selectedRowRquest);

    setOrganizations([
      {
        id: copySelectedRowRquest?.organizationId || null,
        name: copySelectedRowRquest.organizationName,
      },
    ]);
    if (isJustForCopy) {
      copySelectedRowRquest.products.forEach((obj, indx) => {
        obj.loteNumber = "";
      });
    }

    setOpen(true);
    setSubmitStatus(submitText);
  }
  // console.log({selectedRow})

  const getData = async (url) => {
    await axios.get(url).then((response) => {
      setIsLoading(true);
      const res = response.data;
      setTotalData(res.total);
      setDataTable(res.entriesToConfirm);

      if (relation == true) {
        setGeneralData((prev) => ({
          ...prev,
          ...res,
        }));
      }
      setIsLoading(false);
      setRelation(false);
    });
  };
  // console.log(generalData.entities)
  const [submitStatus, setSubmitStatus] = useState("Confirmar");

  const [tabla, setTabla] = useState();
  useEffect(() => {
    setTabla(
      <MUIDataTable
        isRowSelectable={true}
        title={
          <div>
            <div className="flex min-h-[55px]  pt-3">
              <h1 className="text-grey text-lg relative top-1 ">
                Solicitudes de entradas
              </h1>

              <span className="relative -top-2">
                <Input
                  name="user_type"
                  id=""
                  select
                  value={parametersURL.filterObjectValues.status}
                  // value={props.userData.entityCode}
                  size="small"
                  className="ml-4 bg-blue/0 py-1 font-bold"
                  onChange={(e) => {
                    filterObject[
                      "status"
                    ] = `&entryToConfirm[status]=${e.target.value}`;

                    setParametersURL((prev) => ({
                      ...prev,
                      filter: Object.values(filterObject).join(""),
                      page: 1,
                      filterObjectValues: {
                        ...prev.filterObjectValues,
                        status: e.target.value,
                      },
                      filterObject,
                      orderBy:
                        e.target.value == 6 || e.target.value == 7
                          ? "updated_at"
                          : "id",
                      orderDirection: "desc",
                    }));
                  }}
                  // value={user_type_selected}
                >
                  {generalData.entriesRequestStatus?.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                  {/* <MenuItem key={"todos"} value={"*"}>
                      Todos
                    </MenuItem> */}
                </Input>
              </span>
            </div>
          </div>
        }
        data={dataTable}
        options={options}
        columns={columns}
      />
    );
  }, [dataTable]);

  function getColorTransformed(status) {
    if (status == true) {
      return "#011140";
    } else if (status == false) {
      return "#BF0404";
    } else {
      return "rgb(226, 226, 226)";
    }
  }

  const [alert, setAlert] = useState({
    open: false,
    status: "",
    message: "",
  });

  return (
    <>
      <Modal
        show={open}
        width={"96%"}
        onClose={() => setOpen(false)}
        content={
          <form onSubmit={handleTransformSave}>
            <div className="flex flex-col gap-1 mb-3">
              <div
                div
                className="h-6  border-l-8 pl-2 text-xs flex items-center border-blue1"
              >
                Producto transformado a Detal
              </div>
              <div
                div
                className="h-6  border-l-8 pl-2 text-xs flex items-center border-red"
              >
                Producto Mayor que no se pudo transformar porque no tiene un
                Detal asociado
              </div>
              <div
                div
                className="h-6  border-l-8 pl-2 text-xs flex items-center border-light"
              >
                Ya era un producto Detal, no fue necesario transformarlo
              </div>
            </div>
            <table className="w-full">
              <thead className="border py-2 my-3 border-light w-full border-l-8 border-l-white">
                <tr className="header p-0 bg-light text-dark text-xs">
                  <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                    #
                  </th>
                  <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                    Nro Lote
                  </th>
                  <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                    Cód. produ.
                  </th>
                  <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                    Producto
                  </th>
                  <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                    Cantidad
                  </th>
                  <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                    F. de vencimiento
                  </th>
                  {/* <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                    Estado
                  </th>
                  <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                    Observación
                  </th> */}
                </tr>
              </thead>
              {/* <div className="body px-2 grid grid-cols-subgrid px-30  items-center text-sm justify-between"> */}
              <tbody className="pl-5 ">
                {NewRegister?.products?.map((product, i) => {
                  if (true) {
                    return (
                      <tr
                        key={product.id + "a" + i}
                        className={`text-dark text-sm border-l-8 border-r-8`}
                        style={{
                          borderColor: getColorTransformed(
                            NewRegister.products[i]?.itWasTransformed
                          ),
                        }}
                      >
                        <td className="p-2 ">
                          {NewRegister?.products.length - i}
                        </td>
                        <td className="p-2   border-b border-opacity-80 min-w-[140px]  border-light">
                          {NewRegister.products[i]?.loteNumber}
                        </td>
                        <td className="p-2   border-b border-opacity-80 border-light">
                          {product.code}
                        </td>
                        <td className="p-2   border-b border-opacity-80 border-light">
                          <p>
                            <b>{product.name}</b>{" "}
                            {product.unitPerPackage > 1 ? (
                              <span className="text-green font-semibold">
                                {product.unitPerPackage}
                                <small>x</small>{" "}
                              </span>
                            ) : (
                              <span>{product.unitPerPackage}</span>
                            )}{" "}
                            {product.typePresentationName != "N/A"
                              ? product.typePresentationName
                              : ""}{" "}
                            {product.concentrationSize != "N/A" && (
                              <b style={{ color: "#187CBA" }}>
                                {" "}
                                {product.concentrationSize}
                              </b>
                            )}
                          </p>
                        </td>
                        <td className="p-2   border-b border-opacity-80 border-light">
                          {NewRegister.products[i]?.itWasTransformed == true ? (
                            <Input
                              size="small"
                              // data-index={i}
                              label={"Cantidad"}
                              required
                              key={`quantity_${i}`}
                              id={`quantity_${i}`}
                              value={NewRegister.products[i]?.quantity}
                              name={`quantity_${i}`}
                              onChange={(e) => {
                                if (e.target.value > 0) {
                                  setNewRegister((prev) => {
                                    const updatedProducts = [...prev.products];
                                    updatedProducts[i].quantity =
                                      e.target.value;

                                    return {
                                      ...prev,
                                      products: updatedProducts,
                                    };
                                  });
                                }
                              }}
                              type={"number"}
                            />
                          ) : (
                            NewRegister.products[i]?.quantity
                          )}
                        </td>

                        <td className="p-2   border-b border-opacity-80 border-light">
                          {NewRegister.products[i]?.expirationDate}
                        </td>
                        {/* <td className="p-2   border-b border-opacity-80 border-light">
                        {NewRegister.products[i]?.conditionName}
                        </td>
                        <td className="p-2  pl-2 border-b border-opacity-80 border-light">
                          {NewRegister.products[i]?.description}
                        </td> */}
                      </tr>
                    );
                  }
                })}
              </tbody>
            </table>
            <Button3D
              className="mt-7 col-span-3 w-full"
              color={submitStatus == "Confirmar" ? "blue1" : "blue2"}
              text={submitStatus}
              onClick={(e) => {}}
            />
          </form>
        }
      />

      <div className="my-4 mb-6">
        <p className="text-xs">
          A continuación se detallan los productos transferidos desde otros
          inventarios. Si lo confirmas se registraran como entreda y se añadirán
          a tu inventario
        </p>
      </div>
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
        content={modalConfirm.content}
      />
    </>
  );
}
