// src/config/swagger.js
import swaggerUi from "swagger-ui-express";

export { swaggerUi };

export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Fintr4ck API",
    version: "1.0.0",
    description: "Tài liệu API cho Fintr4ck (đồ án web)",
  },
  servers: [
    {
      url: "http://localhost:4000/api/v1",
      description: "Local development",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
        },
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          type: { type: "string", enum: ["income", "expense"] },
          icon: { type: "string" },
        },
      },
      Transaction: {
        type: "object",
        properties: {
          id: { type: "string" },
          type: { type: "string", enum: ["income", "expense"] },
          category: { $ref: "#/components/schemas/Category" },
          amount: { type: "number" },
          note: { type: "string" },
          date: { type: "string", format: "date-time" },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    { name: "System", description: "Kiểm tra trạng thái server" },
    { name: "Auth", description: "Đăng ký, đăng nhập, thông tin user" },
    { name: "Transactions", description: "Quản lý giao dịch" },
    { name: "Categories", description: "Quản lý danh mục thu/chi" },
    { name: "Users", description: "Cài đặt tài khoản" },
    { name: "Reports", description: "Báo cáo, thống kê" },
  ],
  paths: {
    // ========= System =========
    "/health": {
      get: {
        tags: ["System"],
        summary: "Kiểm tra trạng thái server",
        responses: {
          200: {
            description: "Server OK",
          },
        },
      },
    },

    // ========= Auth =========
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Đăng ký tài khoản",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string" },
                  email: { type: "string" },
                  password: { type: "string", minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Đăng ký thành công",
          },
          400: {
            description: "Dữ liệu không hợp lệ / Email đã tồn tại",
          },
        },
      },
    },

    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Đăng nhập và nhận JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Đăng nhập thành công" },
          400: { description: "Sai email hoặc mật khẩu" },
        },
      },
    },

    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Lấy thông tin user hiện tại",
        responses: {
          200: {
            description: "Thông tin user",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          401: { description: "Thiếu hoặc sai token" },
        },
      },
    },

    // ========= Transactions =========
    "/transactions": {
      get: {
        tags: ["Transactions"],
        summary: "Lấy danh sách giao dịch của user (có filter)",
        parameters: [
          {
            name: "type",
            in: "query",
            schema: { type: "string", enum: ["income", "expense"] },
          },
          {
            name: "categoryId",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "from",
            in: "query",
            schema: { type: "string", format: "date" },
          },
          {
            name: "to",
            in: "query",
            schema: { type: "string", format: "date" },
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Danh sách giao dịch",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Transaction" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Transactions"],
        summary: "Tạo giao dịch mới",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["type", "amount"],
                properties: {
                  type: { type: "string", enum: ["income", "expense"] },
                  categoryId: { type: "string" },
                  amount: { type: "number" },
                  note: { type: "string" },
                  date: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Tạo giao dịch thành công" },
        },
      },
    },

    "/transactions/summary": {
      get: {
        tags: ["Transactions"],
        summary: "Tổng quan: balance, income, expense, recent transactions",
        responses: {
          200: { description: "Dữ liệu summary cho Dashboard" },
        },
      },
    },

    // ========= Categories =========
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "Lấy danh sách danh mục của user",
        responses: {
          200: {
            description: "Danh sách category",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Category" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Categories"],
        summary: "Tạo danh mục mới",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "type"],
                properties: {
                  name: { type: "string" },
                  type: { type: "string", enum: ["income", "expense"] },
                  icon: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Tạo danh mục thành công" },
        },
      },
    },

    "/categories/{id}": {
      put: {
        tags: ["Categories"],
        summary: "Cập nhật danh mục",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: { type: "string", enum: ["income", "expense"] },
                  icon: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Cập nhật thành công" },
          404: { description: "Không tìm thấy danh mục" },
        },
      },
      delete: {
        tags: ["Categories"],
        summary: "Xoá danh mục",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Đã xoá danh mục" },
          404: { description: "Không tìm thấy danh mục" },
        },
      },
    },

    // ========= Users (Settings) =========
    "/users/profile": {
      put: {
        tags: ["Users"],
        summary: "Cập nhật tên hiển thị",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Cập nhật thành công" },
        },
      },
    },

    "/users/change-password": {
      put: {
        tags: ["Users"],
        summary: "Đổi mật khẩu",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["currentPassword", "newPassword"],
                properties: {
                  currentPassword: { type: "string" },
                  newPassword: { type: "string", minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Đổi mật khẩu thành công" },
          400: { description: "Mật khẩu hiện tại không đúng hoặc dữ liệu sai" },
        },
      },
    },

    "/users/me": {
      delete: {
        tags: ["Users"],
        summary: "Xoá tài khoản hiện tại và dữ liệu liên quan",
        responses: {
          200: { description: "Đã xoá tài khoản" },
        },
      },
    },

    // ========= Reports =========
    "/reports/expense-breakdown": {
      get: {
        tags: ["Reports"],
        summary: "Breakdown chi tiêu theo category cho chart",
        responses: {
          200: { description: "Dữ liệu breakdown" },
        },
      },
    },
  },
};
