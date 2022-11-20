const { readdirSync, rename, unlink } = require("fs");
const fs = require("fs").promises;
const { resolve } = require("path");
const { XMLParser } = require("fast-xml-parser");

const parser = new XMLParser();

// Get path to pdf folder
const pdfDirPath = resolve(__dirname, "./files");

// Read the xml file and extract the new pdf name + the old one
const fileRead = async (path) => {
  const data = await fs.readFile(`./files/${path}`, "utf8");
  const ot = parser.parse(data);
  const newName =
    ot.datos?.prestacionServicios?.item?.descripcionLinea.split("OT")[1];
  const oldName = path.split(".")[0];
  return { oldName, newName };
};

// Loop through each file, change their name and delete the xml file
const mainFunc = async () => {
  const files = readdirSync(pdfDirPath);
  files.forEach(async (file) => {
    if (file.includes("xml")) {
      const ot = await fileRead(file);
      rename(
        `./files/${ot.oldName}.pdf`,
        `./files/${ot.newName}.pdf`,
        (error) => {
          if (error) console.log(error);
        }
      );
      unlink(`./files/${ot.oldName}.xml`, (error) => {
        if (error) console.log(error);
      });
    }
  });
};

module.exports = mainFunc;
