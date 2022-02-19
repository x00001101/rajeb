const {
  Order,
  Service,
  Billing,
  Post,
} = require("../common/models/main.model");
const PdfPrinter = require("pdfmake");
const Promise = require("bluebird");
const path = require("path");
const fs = require("fs");
const QRcode = require("qrcode");
const { Village } = require("../common/models/region.model");
const bwipjs = require("bwip-js");

const formater = new Intl.NumberFormat(["ban", "id"], {
  maximumFractionDigits: 0,
});

const createPdfNew = async (awb) => {
  const order = await Order.findOne({
    where: { id: awb },
    include: [
      { model: Service },
      { model: Billing },
      { model: Village, as: "origin" },
      { model: Village, as: "destination" },
    ],
  });

  if (order === null) {
    return false;
  }

  const originPost = await Post.findOne({
    where: { regionId: order.origin.DistrictId },
  });

  const destinationPost = await Post.findOne({
    where: { regionId: order.destination.DistrictId },
  });

  let date_ob = new Date();

  // current date
  // adjust 0 before single digit date
  let date = ("0" + date_ob.getDate()).slice(-2);
  // current month
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  // current year
  let year = date_ob.getFullYear();
  // current hours
  let hours = date_ob.getHours();
  // current minutes
  let minutes = date_ob.getMinutes();
  // current seconds
  let seconds = date_ob.getSeconds();
  const date_print =
    year +
    "-" +
    month +
    "-" +
    date +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds;

  //check the length of addresses
  let originAddress = order.senderAddress;
  let originLength = originAddress.length;
  let destinationAddress = order.recipientAddress;
  let destinationLength = destinationAddress.length;
  let itemValue = order.itemValue;

  let dateCreated = new Date(order.createdAt);

  date = ("0" + dateCreated.getDate()).slice(-2);
  // current month
  month = ("0" + (dateCreated.getMonth() + 1)).slice(-2);
  // current year
  year = dateCreated.getFullYear();

  dateCreated = date + "/" + month + "/" + year;

  // new line parameter
  const minLength = 31;

  const getNewLine = (length, minLength) => {
    if (length > minLength) {
      return;
    } else {
      return {
        text: " ",
      };
    }
  };

  const font = {
    SpaceMono: {
      normal: path.join(__dirname, "/fonts", "/SpaceMono-Regular.ttf"),
      bold: path.join(__dirname, "/fonts", "/SpaceMono-Bold.ttf"),
      italics: path.join(__dirname, "/fonts", "/SpaceMono-Italic.ttf"),
      bolditalics: path.join(__dirname, "/fonts", "/SpaceMono-BoldItalic.ttf"),
    },
  };

  var bitmap = fs.readFileSync(path.join("src", "img", "logo.jpeg"));
  var logo = "data:image/jpeg;base64," + Buffer.from(bitmap).toString("base64");

  const QR = await QRcode.toDataURL("http://localhost:3600/tracking?id=" + awb);
  // barcode
  let bar = await bwipjs.toBuffer({
    bcid: "code128",
    text: awb,
    scale: 5,
    height: 20,
    includetext: false,
  });
  const barcode =
    "data:image/png;base64," + Buffer.from(bar).toString("base64");

  const printer = new PdfPrinter(font);

  const docDefinition = {
    pageSize: {
      width: 300,
      height: 200,
    },
    pageMargins: [5, 0, 5, 0],
    content: [
      {
        style: "tableZeroMargin",
        table: {
          widths: [80, "*"],
          body: [
            [
              { image: logo, width: 80 },
              { rowSpan: 2, image: barcode, width: 200, height: 40 },
            ],
            [{ text: `Resi: ${awb}`, fontSize: 6, bold: true }, ""],
          ],
        },
        layout: "noBorders",
      },
      {
        style: "tableZeroMargin",
        table: {
          widths: ["*", "*"],
          heights: 60,
          body: [
            [
              {
                text: [
                  "Pengirim: ",
                  {
                    text: `${order.senderFullName}\n ${order.senderPhoneNumber}\n ${order.senderAddress}`,
                    bold: true,
                  },
                ],
              },
              {
                text: [
                  "Penerima: ",
                  {
                    text: `${order.recipientFullName}\n ${order.recipientPhoneNumber}\n ${order.recipientAddress}`,
                    bold: true,
                  },
                ],
              },
            ],
          ],
        },
      },
      {
        style: "tableZeroMargin",
        table: {
          widths: [150, "auto", "*"],
          body: [
            [
              {
                rowSpan: 2,
                text: [
                  {
                    text: `Berat     : ${order.itemWeight} Kg.
                      Tarif     : Rp. ${order.Billing.serviceAmount}
                      Nom.      : Rp. ${order.itemValue}
                      Ttl.      : `,
                    fontSize: 5,
                  },
                  {
                    text: `Rp. ${
                      Number(order.Billing.totalAmount) +
                      Number(order.itemValue)
                    }\n`,
                    bold: true,
                    fontSize: 5,
                  },
                  {
                    text: `Tgl. Krm. : ${dateCreated}
                      Brg.      : ${order.itemName}`,
                    fontSize: 5,
                  },
                ],
              },
              { rowSpan: 2, image: QR, width: 60, alignment: "center" },
              {
                text: `${order.Billing.BillingTypeId}`,
                fontSize: 16,
                bold: true,
                alignment: "center",
              },
            ],
            [
              "",
              "",
              {
                text: `${destinationPost.id}`,
                fontSize: 13,
                bold: true,
                alignment: "center",
              },
            ],
          ],
        },
      },
      {
        style: "tableFooter",
        table: {
          widths: ["*"],
          body: [
            [
              {
                text: "Terima Kasih telah menggunakan layanan Kami! CS: +62 811 808 738",
                alignment: "center",
                fontSize: 6,
              },
            ],
          ],
        },
      },
    ],
    styles: {
      tableZeroMargin: {
        margin: [0, 0, 0, 0],
      },
      tableFooter: {
        margin: [0, 5, 0, 5],
      },
    },
    defaultStyle: {
      font: "SpaceMono",
      fontSize: 7,
    },
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  return new Promise((resolve, reject) => {
    try {
      if (order === null) {
        reject({ message: "Id not found!" });
      }
      let chunks = [];
      pdfDoc.on("data", (chunk) => chunks.push(chunk));
      pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
      pdfDoc.end();
    } catch (err) {
      reject(err);
    }
  });
};

const createPdf = async (awb) => {
  // find order id
  const order = await Order.findOne({
    where: { id: awb },
    include: [
      { model: Service },
      { model: Billing },
      { model: Village, as: "origin" },
      { model: Village, as: "destination" },
    ],
  });

  if (order === null) {
    return false;
  }

  const originPost = await Post.findOne({
    where: { regionId: order.origin.DistrictId },
  });

  const destinationPost = await Post.findOne({
    where: { regionId: order.destination.DistrictId },
  });

  let date_ob = new Date();

  // current date
  // adjust 0 before single digit date
  let date = ("0" + date_ob.getDate()).slice(-2);
  // current month
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  // current year
  let year = date_ob.getFullYear();
  // current hours
  let hours = date_ob.getHours();
  // current minutes
  let minutes = date_ob.getMinutes();
  // current seconds
  let seconds = date_ob.getSeconds();
  const date_print =
    year +
    "-" +
    month +
    "-" +
    date +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds;

  //check the length of addresses
  let originAddress = order.senderAddress;
  let originLength = originAddress.length;
  let destinationAddress = order.recipientAddress;
  let destinationLength = destinationAddress.length;
  let itemValue = order.itemValue;

  // new line parameter
  const minLength = 31;

  const getNewLine = (length, minLength) => {
    if (length > minLength) {
      return;
    } else {
      return {
        text: " ",
      };
    }
  };

  const font = {
    SpaceMono: {
      normal: path.join(__dirname, "/fonts", "/SpaceMono-Regular.ttf"),
      bold: path.join(__dirname, "/fonts", "/SpaceMono-Bold.ttf"),
      italics: path.join(__dirname, "/fonts", "/SpaceMono-Italic.ttf"),
      bolditalics: path.join(__dirname, "/fonts", "/SpaceMono-BoldItalic.ttf"),
    },
  };

  var bitmap = fs.readFileSync(path.join("src", "img", "logo.jpeg"));
  var logo = "data:image/jpeg;base64," + Buffer.from(bitmap).toString("base64");

  const QR = await QRcode.toDataURL("http://localhost:3600/tracking?id=" + awb);
  // barcode
  let bar = await bwipjs.toBuffer({
    bcid: "code128",
    text: awb,
    scale: 3,
    height: 10,
    includetext: true,
    textxalign: "center",
  });
  const barcode =
    "data:image/png;base64," + Buffer.from(bar).toString("base64");

  const printer = new PdfPrinter(font);
  const docDefinition = {
    pageSize: {
      width: 100,
      height: 150,
    },
    pageMargins: 5,
    // content: [
    //   { image: logo, width: 30, alignment: "center" },
    //   { text: " " },
    //   { image: buf, width: 66, height: 20, alignment: "center" },
    // ],
    footer: {
      columns: [date_print, { text: "Test User", alignment: "right" }],
    },
    content: [
      {
        columns: [
          { image: logo, width: 30 },
          { image: barcode, width: 60, height: 15 },
        ],
      },
      {
        text: "JEB - " + order.Service.name,
        alignment: "center",
      },
      {
        text: "No. Resi : " + order.id,
        alignment: "center",
      },
      {
        text: "Pengirim",
        bold: true,
      },
      {
        columns: [
          { text: "Nama         :", width: 27 },
          { text: order.senderFullName },
        ],
      },
      {
        columns: [
          { text: "Telepon      :", width: 27 },
          { text: order.senderPhoneNumber },
        ],
      },
      {
        columns: [
          { text: "Alamat       :", width: 27 },
          { text: order.senderAddress },
        ],
      },
      getNewLine(originLength, minLength),
      {
        text: "Penerima",
        bold: true,
      },
      {
        columns: [
          { text: "Nama         :", width: 27 },
          { text: order.recipientFullName },
        ],
      },
      {
        columns: [
          { text: "Telepon      :", width: 27 },
          { text: order.recipientPhoneNumber },
        ],
      },
      {
        columns: [
          { text: "Alamat       :", width: 27 },
          { text: order.recipientAddress },
        ],
      },
      getNewLine(destinationLength, minLength),
      {
        columns: [
          { text: "Jenis        :", width: 27 },
          { text: order.TypeId },
        ],
      },
      {
        columns: [
          { text: "Berat        :", width: 27 },
          { text: order.itemWeight + "(Kg)" },
        ],
      },
      {
        columns: [
          { text: "Ongkir       :", width: 27 },
          { text: "Rp. " + order.Billing.serviceAmount },
        ],
      },
      {
        columns: [
          { text: "Diskon       :", width: 27 },
          { text: "Rp. " + order.Billing.voucherAmount },
        ],
      },
      {
        columns: [
          { text: "Asuransi     :", width: 27 },
          { text: "Rp. " + order.Billing.insuranceAmount },
        ],
      },
      {
        columns: [
          { text: "Total        :", width: 27 },
          { text: "Rp. " + order.Billing.totalAmount },
          {
            text: originPost.id + " - " + destinationPost.id,
            bold: true,
            alignment: "center",
          },
        ],
      },
      { text: " " },
      {
        columns: [
          [
            {
              text: "Transaksi    : " + order.Billing.BillingTypeId,
            },
            {
              text: "Nama Barang  : " + order.itemName,
            },
            {
              text: "Harga Barang : Rp. " + itemValue.toFixed(2),
            },
            { text: " " },
            {
              text:
                "Tot. Trans   : Rp. " +
                (
                  parseInt(itemValue) + parseInt(order.Billing.totalAmount)
                ).toFixed(2),
              bold: true,
            },
          ],
          {
            image: QR,
            width: 30,
            alignment: "right",
          },
        ],
      },
    ],
    defaultStyle: {
      font: "SpaceMono",
      fontSize: 3,
    },
  };
  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  return new Promise((resolve, reject) => {
    try {
      if (order === null) {
        reject({ message: "Id not found!" });
      }
      let chunks = [];
      pdfDoc.on("data", (chunk) => chunks.push(chunk));
      pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
      pdfDoc.end();
    } catch (err) {
      reject(err);
    }
  });
};

const createPdf10075 = async (awb) => {
  const order = await Order.findOne({
    where: { id: awb },
    include: [
      { model: Service },
      { model: Billing },
      { model: Village, as: "origin" },
      { model: Village, as: "destination" },
    ],
  });

  if (order === null) {
    return false;
  }

  const originPost = await Post.findOne({
    where: { regionId: order.origin.DistrictId },
  });

  const destinationPost = await Post.findOne({
    where: { regionId: order.destination.DistrictId },
  });

  let date_ob = new Date();

  // current date
  // adjust 0 before single digit date
  let date = ("0" + date_ob.getDate()).slice(-2);
  // current month
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  // current year
  let year = date_ob.getFullYear();
  // current hours
  let hours = date_ob.getHours();
  // current minutes
  let minutes = date_ob.getMinutes();
  // current seconds
  let seconds = date_ob.getSeconds();
  const date_print =
    year +
    "-" +
    month +
    "-" +
    date +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds;

  //check the length of addresses
  let originAddress = order.senderAddress;
  let originLength = originAddress.length;
  let destinationAddress = order.recipientAddress;
  let destinationLength = destinationAddress.length;
  let itemValue = order.itemValue;

  let dateCreated = new Date(order.createdAt);

  date = ("0" + dateCreated.getDate()).slice(-2);
  // current month
  month = ("0" + (dateCreated.getMonth() + 1)).slice(-2);
  // current year
  year = dateCreated.getFullYear();

  dateCreated = date + "/" + month + "/" + year;

  // new line parameter
  const minLength = 31;

  const getNewLine = (length, minLength) => {
    if (length > minLength) {
      return;
    } else {
      return {
        text: " ",
      };
    }
  };

  const font = {
    SpaceMono: {
      normal: path.join(__dirname, "/fonts", "/SpaceMono-Regular.ttf"),
      bold: path.join(__dirname, "/fonts", "/SpaceMono-Bold.ttf"),
      italics: path.join(__dirname, "/fonts", "/SpaceMono-Italic.ttf"),
      bolditalics: path.join(__dirname, "/fonts", "/SpaceMono-BoldItalic.ttf"),
    },
  };

  var bitmap = fs.readFileSync(path.join("src", "img", "logo.jpeg"));
  var logo = "data:image/jpeg;base64," + Buffer.from(bitmap).toString("base64");

  const QR = await QRcode.toDataURL("http://localhost:3600/tracking?id=" + awb);
  // barcode
  let bar = await bwipjs.toBuffer({
    bcid: "code128",
    text: awb,
    scale: 5,
    height: 20,
    includetext: false,
  });
  const barcode =
    "data:image/png;base64," + Buffer.from(bar).toString("base64");

  const printer = new PdfPrinter(font);

  const docDefinition = {
    pageSize: {
      width: 300,
      height: 225,
    },
    pageMargins: [5, 10, 5, 0],
    content: [
      {
        style: "tableZeroMargin",
        table: {
          widths: [80, "*"],
          body: [
            [
              { image: logo, width: 80 },
              { rowSpan: 2, image: barcode, width: 200, height: 40 },
            ],
            [{ text: `Resi: ${awb}`, fontSize: 6, bold: true }, ""],
          ],
        },
        layout: "noBorders",
      },
      {
        style: "tableZeroMargin",
        table: {
          widths: ["*", "*"],
          heights: 60,
          body: [
            [
              {
                text: [
                  "Pengirim: ",
                  {
                    text: `${order.senderFullName}\n ${order.senderPhoneNumber}\n ${order.senderAddress}`,
                    bold: true,
                  },
                ],
              },
              {
                text: [
                  "Penerima: ",
                  {
                    text: `${order.recipientFullName}\n ${order.recipientPhoneNumber}\n ${order.recipientAddress}`,
                    bold: true,
                  },
                ],
              },
            ],
          ],
        },
      },
      {
        style: "tableZeroMargin",
        table: {
          widths: [150, "auto", "*"],
          body: [
            [
              {
                rowSpan: 2,
                text: [
                  {
                    text: `Berat     : ${order.itemWeight} Kg.
                      Tarif     : Rp. ${formater.format(
                        order.Billing.serviceAmount
                      )}
                      Nom.      : Rp. ${formater.format(order.itemValue)}
                      Ttl.      : `,
                    fontSize: 6,
                  },
                  {
                    text: `Rp. ${formater.format(
                      Number(order.Billing.totalAmount) +
                        Number(order.itemValue)
                    )}\n`,
                    bold: true,
                    fontSize: 6,
                  },
                  {
                    text: `Tgl. Krm. : ${dateCreated}
                      Brg.      : ${order.itemName}`,
                    fontSize: 6,
                  },
                ],
              },
              { rowSpan: 2, image: QR, width: 60, alignment: "center" },
              {
                text: `${order.Billing.BillingTypeId}`,
                fontSize: 16,
                bold: true,
                alignment: "center",
              },
            ],
            [
              "",
              "",
              {
                text: `${destinationPost.id}`,
                fontSize: 13,
                bold: true,
                alignment: "center",
              },
            ],
          ],
        },
      },
      {
        style: "tableFooter",
        table: {
          widths: ["*"],
          body: [
            [
              {
                text: "Terima Kasih telah menggunakan layanan Kami! CS: +62 811 808 738",
                alignment: "center",
                fontSize: 6,
              },
            ],
          ],
        },
      },
    ],
    styles: {
      tableZeroMargin: {
        margin: [0, 0, 0, 0],
      },
      tableFooter: {
        margin: [0, 5, 0, 5],
      },
    },
    defaultStyle: {
      font: "SpaceMono",
      fontSize: 7,
    },
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  return new Promise((resolve, reject) => {
    try {
      if (order === null) {
        reject({ message: "Id not found!" });
      }
      let chunks = [];
      pdfDoc.on("data", (chunk) => chunks.push(chunk));
      pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
      pdfDoc.end();
    } catch (err) {
      reject(err);
    }
  });
};
exports.createPdf = createPdf;
exports.createPdfNew = createPdfNew;
exports.createPdf10075 = createPdf10075;
