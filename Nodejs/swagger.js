import swaggerAutogen from "swagger-autogen";

const doc = {
  swagger: "2.0",
  info: {
    title: "Holiday App API",
    version: "1.0.0",
  },
  servers: [
    {
      url: "http://localhost:5000/",
    },
  ],
};
const outputFile = "./swagger_output.json";
const endpointsFiles = ["./src/index.js"];
swaggerAutogen()(outputFile, endpointsFiles, doc);
