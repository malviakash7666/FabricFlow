import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Sequelize, DataTypes } from "sequelize";
import dotenv from "dotenv";

dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const basename = path.basename(__filename);

const db = {};


// Database Connection

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",

    logging: false,

    dialectOptions:
      process.env.DB_SSL === "true"
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : {},
  }
);



// Load only *.model.js files

const modelFiles = fs
  .readdirSync(__dirname)
  .filter((file) => {

    return (
      file !== basename &&
      file.endsWith(".model.js")
    );

  });



for (const file of modelFiles) {


  const modelPath = path.join(
    __dirname,
    file
  );


  const { default: model } = await import(
    pathToFileURL(modelPath).href
  );


  const initializedModel = model(
    sequelize,
    DataTypes
  );


  db[initializedModel.name] =
    initializedModel;

}



// Setup Associations

Object.keys(db).forEach((modelName)=>{

  if(db[modelName].associate){

    db[modelName].associate(db);

  }

});



db.sequelize = sequelize;

db.Sequelize = Sequelize;


export default db;