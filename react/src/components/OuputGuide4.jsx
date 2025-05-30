import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import secretariaLogo from "../assets/img/logo_secretaria-circle-main.png";
import myBoldFont from "../assets/fonts/Montserrat-Bold.ttf";
import normalFont from "../assets/fonts/Montserrat-Regular.ttf";

Font.register({ family: "fontBold", src: myBoldFont });
Font.register({ family: "normalFont", src: normalFont });

const entitiesCodesBoss = {
  1: { name: "Jefferson Medina", ci: "25783190" },
  "1-2": { name: "Maria Coello", ci: "8776336" },
};

// Create styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 10,
    fontFamily: "normalFont",
  },
  pageContainer: {
    position: "relative",
    height: "100%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  section: {
    marginBottom: 2,
    padding: 4,
    border: "1px solid #e9e9e9",
    flexGrow: 1,
    //   height: "160px",
    minWidth: "260.25984252 !important",
    maxWidth: "260.25984252 !important",
    position: "relative",
    overflow: "hidden !important",
  },
  header: {
    // flexDirection: "row",
    textAlign: "center",

    width: "100%",
    //   overflow: "hidden !important",
  },
  textHeader: {
    position: "absolute",
    textAlign: "center",
    // fontSize: 16,
    position: "absolute",
    top: -22,
    width: "100%",
    left: 10,
    backgroundColor: "transparent",
  },
  img: {
    width: 30,
    // height: 57,
    objectFit: "cover",
    position: "relative",
    top: "-4px",
  },
  membrete: {
    fontSize: 10,
    textAlign: "center",
    width: "100%",
    fontWeight: "800",
    marginTop: 20,
    // marginLeft: 20,
    // color: "#555555",
  },
  guideTitle: {
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "fontBold",
    marginTop: 2,
  },
  infoGuide: {
    flexDirection: "row",
    justifyContent: "left",
    width: "100%",
    fontSize: 10,
    marginTop: 3,
    // paddingHorizontal: 10,
  },
  leftInfo: {
    flexDirection: "row",
    gap: 10,
  },
  rigthInfo: {
    flexDirection: "row",
    gap: 10,
  },
  textRigth: {
    textAlign: "right",
    width: 100,
    color: "#555555",
  },
  parentTable: {
    border: 1,
    borderRadius: 6,
    marginTop: 5,
    borderColor: "#696969",
    overflow: "hidden",
  },
  table: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    borderStyle: "solid",
    // borderBottom: 1,
    // borderColor: "#000",
    // marginBottom: 10,
    borderColor: "#696969",
    overflow: "hidden",
  },
  tableHeader: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    borderStyle: "solid",
    borderBottom: 1,
    borderColor: "#696969",
    fontWeight: "bold",
    fontFamily: "fontBold",
    fontSize: 9,
    // marginBottom: 10,
  },
  tableCell: {
    borderStyle: "solid",

    color: "black",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 2,
    paddingVertical: 3,
    fontSize: 9,
  },
  nroCell: {
    borderRight: 1,
    borderColor: "#c4c4c4",
    width: 15,
    fontSize: 7,
  },
  firstCell: {
    //nro de lote
    borderStyle: "solid",
    borderRight: 1,
    borderColor: "#c4c4c4",
    fontSize: 7,
    width: 46,
  },

  lastCell: {
    minWidth: 30,
    // borderLeft: 1,
    borderColor: "#c4c4c4",
  },
  middleCell: {
    flex: 1,
    borderRight: 1,
    borderColor: "#c4c4c4",
    fontSize: 8,
  },
  footer: {
    width: "100%",
    // position: "absolute",
    // bottom: 150,
    marginTop: 5,
    textAlign: "center",
    fontSize: 9,
    fontWeight: 700,
    // top: "-14",
    // paddingHorizontal: 25,
  },
  firmas: {
    width: "100%",
    borderLeft: 0,
    borderRight: 0,
    flexDirection: "row",
    // marginBottom: 60,
    justifyContent: "space-between",
    color: "#202020",
    fontWeight: "bold",
    fontFamily: "fontBold",
  },
  dosFirmas: {
    flexDirection: "row",
    // textAlign: "center",
    justifyContent: "space-around",
    // gap: 10,
  },
});

// Create Document Component
export default function OuputGuide(props) {
  let nroColProduct = 0;
  const nroProducts = props.output?.products?.length;
  // Genera el arreglo de objetos dividido en filas y columnas
  const sections = [];
  let currentRow = [];

  for (let i = 0; i < nroProducts; i++) {
    currentRow.push(props.output?.products?.[i]);
    let rowsLength = currentRow.length;
    if (
      (rowsLength === 11 && sections.length == 0) ||
      (rowsLength == 20 && sections.length !== 0) ||
      i == nroProducts - 1
    ) {
      sections.push(currentRow);
      currentRow = [];
    }
  }

  return (
    <Document
    // fileName={`${props.output.code}`}
    >
      {sections.map((row, rowIndex) => {
        const [year, month, day] =
          props.output.departureDate?.split("-") || "n/a";
        let date = `${day}-${month}-${year}`;
        return (
          <Page
            key={`page-${rowIndex}`}
            size={{ width: 301.8, height: 395.3 }}
            style={{
              backgroundColor: "#ffffff",
              padding: 10,
              fontFamily: "normalFont",
              paddingTop: 20,
            }}
            // wrap={false}
          >
            <View style={styles.pageContainer}>
              {rowIndex == 0 && (
                <>
                  <View style={styles.header}>
                    <Image src={secretariaLogo} style={styles.img} />
                    <View style={styles.textHeader}>
                      <Text style={styles.membrete}>
                        DIVISION DE SUMINISTROS E INSUMOS
                      </Text>
                      <Text style={styles.guideTitle}>ORDEN DE SALIDA</Text>
                    </View>
                  </View>

                  <View style={styles.infoGuide}>
                    <View style={styles.leftInfo}>
                      <View>
                        <Text>Destino: {props.output.organizationName}</Text>
                        <Text>Recibe: {props.output.receiverFullname} </Text>
                        <Text>Cédula: {props.output.receiverCi}</Text>
                        <Text>Nro Guia: {props.output.guide}</Text>
                        <Text>
                          Fecha | hora: {date} | {props.output.departureTime}
                        </Text>
                        <Text>Elaborado por: {props.output?.userFullName}</Text>
                      </View>
                    </View>
                  </View>
                </>
              )}

              <View style={styles.parentTable}>
                <View style={styles.tableHeader}>
                  <View style={[styles.tableCell, styles.nroCell]}>
                    <Text>N°</Text>
                  </View>
                  <View style={[styles.tableCell, styles.firstCell]}>
                    <Text>Lote</Text>
                  </View>
                  <View style={[styles.tableCell, styles.middleCell]}>
                    <Text>Producto</Text>
                  </View>
                  <View style={[styles.tableCell, styles.lastCell]}>
                    <Text>Cant</Text>
                  </View>
                </View>

                {row.map((product, indx) => {
                  nroColProduct++;
                  return (
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        width: "100%",
                        borderStyle: "solid",
                        borderColor: "#e9e9e9",
                        overflow: "hidden",
                        backgroundColor: indx % 2 === 0 ? "#f1f1f1" : "white",
                      }}
                      key={product.loteNumber + product.indx}
                    >
                      <View style={[styles.tableCell, styles.nroCell]}>
                        <Text>{nroColProduct}</Text>
                      </View>
                      <View style={[styles.tableCell, styles.firstCell]}>
                        <Text>{product.loteNumber}</Text>
                      </View>
                      <View style={[styles.tableCell, styles.middleCell]}>
                        <Text>
                          {`${product.name} ${
                            product.unitPerPackage > 1
                              ? `${product.unitPerPackage}x`
                              : product.unitPerPackage
                          } ${" "}${
                            product.typePresentationName !== "N/A"
                              ? product.typePresentationName
                              : ""
                          }${" "}${
                            product.concentrationSize !== "N/A"
                              ? product.concentrationSize
                              : ""
                          }`}
                        </Text>
                      </View>
                      <View style={[styles.tableCell, styles.lastCell]}>
                        <Text>{product.quantity}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {rowIndex == sections.length - 1 && (
                <View style={styles.footer}>
                  <View style={styles.firmas}>
                    <View style={{}}>
                      <Text>Jefe de almacén</Text>

                      <View style={{ marginTop: 25, fontFamily: "normalFont" }}>
                        <Text>{entitiesCodesBoss[props.entityCode].name}</Text>
                        <Text>
                          C.I. {entitiesCodesBoss[props.entityCode].ci}
                        </Text>
                      </View>
                    </View>

                    <View>
                      <Text>Despachador </Text>
                    </View>
                    <View>
                      <Text>Beneficiario </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            <View
              fixed
              style={{
                position: "absolute",
                fontSize: "9",
                top: 9,
                right: 5,
                flexDirection: "row",
              }}
            >
              <Text
                style={{
                  fontFamily: "fontBold",
                  fontWeight: "bold",
                }}
              >
                {rowIndex + 1}{" "}
              </Text>
              <Text>de {sections.length}</Text>
            </View>
          </Page>
        );
      })}
    </Document>
  );
}
