// Cấu hình đơn giản cho Swagger UI

import swaggerUi from "swagger-ui-express";

const serverLocal = {
  url: "http://localhost:4000/api/v1",
  description: "Local development"
};

const serverProd = process.env.SWAGGER_SERVER_URL
  ? {
      url: process.env.SWAGGER_SERVER_URL,
      description: "Deployed API"
    }
  : null;

const servers = [serverLocal, serverProd].filter(Boolean);

// Spec viết tay, đủ để thuyết trình và test
export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Fintr4ck API",
    version: "1.0.0",
    description: "Tài liệu API cho Fintr4ck (đồ án web)."
  },
  servers,
  paths: {
    "/health": {
      get: {
        summary: "Kiểm tra trạng thái server",
        tags: ["System"],
        responses: {
          200: {
            description: "Server OK"
          }
        }
      }
    },
    "/auth/register": {
      post: {
        summary: "Đăng ký tài khoản",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  email: { type: "string" },
                  password: { type: "string" }
                },
                required: ["email", "password"]
              }
            }
          }
        },
        responses: {
          201: { description: "Tạo user mới thành công" },
          400: { description: "Email đã tồn tại hoặc dữ liệu không hợp lệ" }
        }
      }
    },
    "/auth/login": {
      post: {
        summary: "Đăng nhập và nhận JWT",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  password: { type: "string" }
                },
                required: ["email", "password"]
              }
            }
          }
        },
        responses: {
          200: { description: "Đăng nhập thành công, trả về token" },
          401: { description: "Sai email hoặc mật khẩu" }
        }
      }
    },
    "/auth/me": {
      get: {
        summary: "Lấy thông tin user hiện tại (cần Bearer token)",
        tags: ["Auth"],
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          200: { description: "Trả về thông tin user" },
          401: { description: "Thiếu hoặc token không hợp lệ" }
        }
      }
    },
    "/transactions": {
      get: {
        summary: "Lấy danh sách giao dịch của user",
        tags: ["Transactions"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Danh sách giao dịch" }
        }
      },
      post: {
        summary: "Tạo giao dịch mới",
        tags: ["Transactions"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["income", "expense"] },
                  category: { type: "string" },
                  amount: { type: "number" },
                  date: { type: "string", format: "date-time" },
                  note: { type: "string" }
                },
                required: ["type", "amount", "date"]
              }
            }
          }
        },
        responses: {
          201: { description: "Tạo giao dịch thành công" }
        }
      }
    },
    "/transactions/{id}": {
      put: {
        summary: "Cập nhật giao dịch",
        tags: ["Transactions"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          200: { description: "Cập nhật thành công" }
        }
      },
      delete: {
        summary: "Xóa giao dịch",
        tags: ["Transactions"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          204: { description: "Xóa thành công" }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  }
};

export { swaggerUi };