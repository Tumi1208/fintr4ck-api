// File này để setup tài liệu Swagger UI cho API
// Swagger giúp test và xem mô tả API ngay trên trình duyệt (localhost:4000/docs)

import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// Cấu hình cơ bản cho Swagger
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Fintr4ck API",
      version: "1.0.0",
      description: "Tài liệu API cho dự án quản lý chi tiêu cá nhân"
    },
    servers: [{ url: "http://localhost:4000/api/v1" }]
  },
  // Swagger sẽ quét các file routes có mô tả @openapi
  apis: ["./src/routes/*.js"]
};

// Tạo spec để export sang app.js
export const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi };
