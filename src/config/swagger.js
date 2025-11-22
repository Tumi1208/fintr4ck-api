// src/config/swagger.js
import swaggerUi from "swagger-ui-express";

export { swaggerUi };

export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Fintr4ck API",
    version: "1.0.0",
    description: "Tài liệu API Fintr4ck (backend) cho web app hiện tại. Ngôn ngữ mặc định: tiếng Việt.",
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
          _id: { type: "string" },
          name: { type: "string" },
          displayName: { type: "string", description: "Tên hiển thị của người dùng" },
          email: { type: "string" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: { $ref: "#/components/schemas/User" },
        },
      },
      Category: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          type: { type: "string", enum: ["income", "expense"] },
          icon: { type: "string" },
        },
      },
      CategoryList: {
        type: "array",
        items: { $ref: "#/components/schemas/Category" },
      },
      Transaction: {
        type: "object",
        properties: {
          _id: { type: "string" },
          type: { type: "string", enum: ["income", "expense"] },
          category: { $ref: "#/components/schemas/Category" },
          user: { $ref: "#/components/schemas/User" },
          amount: { type: "number" },
          note: { type: "string" },
          date: { type: "string", format: "date-time" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      TransactionList: {
        type: "array",
        items: { $ref: "#/components/schemas/Transaction" },
      },
      Summary: {
        type: "object",
        properties: {
          currentBalance: { type: "number" },
          totalIncome: { type: "number" },
          totalExpense: { type: "number" },
          recentTransactions: { $ref: "#/components/schemas/TransactionList" },
        },
      },
      Message: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
      Budget: {
        type: "object",
        properties: {
          _id: { type: "string" },
          categoryId: { type: "string" },
          period: { type: "string", enum: ["monthly"] },
          limitAmount: { type: "number" },
          monthKey: { type: "string", example: "2024-11" },
        },
      },
      Challenge: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          type: { type: "string", enum: ["NO_SPEND", "SAVE_FIXED", "CUSTOM"] },
          durationDays: { type: "number" },
          targetAmountPerDay: { type: "number" },
          isActive: { type: "boolean" },
        },
      },
      UserChallenge: {
        type: "object",
        properties: {
          _id: { type: "string" },
          challenge: { $ref: "#/components/schemas/Challenge" },
          status: { type: "string", enum: ["ACTIVE", "COMPLETED", "FAILED"] },
          joinedAt: { type: "string", format: "date-time" },
          startDate: { type: "string", format: "date-time" },
          lastCheckInDate: { type: "string", format: "date-time" },
          completedDays: { type: "number" },
          currentStreak: { type: "number" },
          longestStreak: { type: "number" },
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
    { name: "Auth", description: "Đăng ký, đăng nhập, đặt lại mật khẩu" },
    { name: "Transactions", description: "Quản lý giao dịch (dashboard, transactions page)" },
    { name: "Categories", description: "Quản lý danh mục thu/chi" },
    { name: "Challenges", description: "Danh sách challenge, tham gia, check-in" },
    { name: "Users", description: "Cài đặt tài khoản (hồ sơ, mật khẩu, xoá tài khoản)" },
    { name: "Reports", description: "Báo cáo/biểu đồ" },
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
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } },
          },
          400: {
            description: "Dữ liệu không hợp lệ / Email đã tồn tại",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Message" } } },
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
          200: {
            description: "Đăng nhập thành công",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } },
          },
          400: { description: "Sai email hoặc mật khẩu", content: { "application/json": { schema: { $ref: "#/components/schemas/Message" } } } },
        },
      },
    },

    "/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Đặt lại mật khẩu (mock/demo)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "newPassword"],
                properties: {
                  email: { type: "string" },
                  newPassword: { type: "string", minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Đặt lại mật khẩu thành công (trả mock)" },
          400: { description: "Dữ liệu không hợp lệ" },
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
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1 },
            description: "Giới hạn số giao dịch trả về (mặc định không giới hạn)",
          },
        ],
        responses: {
          200: {
            description: "Danh sách giao dịch",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TransactionList" },
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
      delete: {
        tags: ["Transactions"],
        summary: "Xoá toàn bộ giao dịch của user hiện tại",
        responses: {
          200: { description: "Đã xoá tất cả giao dịch", content: { "application/json": { schema: { $ref: "#/components/schemas/Message" } } } },
        },
      },
    },

    "/transactions/bulk-delete": {
      post: {
        tags: ["Transactions"],
        summary: "Xoá nhiều giao dịch đã chọn",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["ids"],
                properties: {
                  ids: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Đã xoá giao dịch",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Message" } } },
          },
          400: { description: "Danh sách giao dịch không hợp lệ" },
        },
      },
    },

    "/transactions/summary": {
      get: {
        tags: ["Transactions"],
        summary: "Tổng quan: balance, income, expense, recent transactions",
        responses: {
          200: {
            description: "Dữ liệu summary cho Dashboard",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Summary" } } },
          },
        },
      },
    },

    "/transactions/{id}": {
      put: {
        tags: ["Transactions"],
        summary: "Cập nhật giao dịch",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
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
          200: {
            description: "Cập nhật thành công",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Transaction" } } },
          },
          404: { description: "Không tìm thấy giao dịch", content: { "application/json": { schema: { $ref: "#/components/schemas/Message" } } } },
        },
      },
      delete: {
        tags: ["Transactions"],
        summary: "Xoá giao dịch",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Đã xoá giao dịch", content: { "application/json": { schema: { $ref: "#/components/schemas/Message" } } } },
          404: { description: "Không tìm thấy giao dịch", content: { "application/json": { schema: { $ref: "#/components/schemas/Message" } } } },
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
                schema: { $ref: "#/components/schemas/CategoryList" },
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
          200: {
            description: "Cập nhật thành công",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Category" } } },
          },
          404: { description: "Không tìm thấy danh mục", content: { "application/json": { schema: { $ref: "#/components/schemas/Message" } } } },
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
          200: { description: "Đã xoá danh mục", content: { "application/json": { schema: { $ref: "#/components/schemas/Message" } } } },
          404: { description: "Không tìm thấy danh mục", content: { "application/json": { schema: { $ref: "#/components/schemas/Message" } } } },
        },
      },
    },

    // ========= Challenges =========
    "/challenges": {
      get: {
        tags: ["Challenges"],
        summary: "Danh sách challenge đang hoạt động",
        responses: {
          200: {
            description: "Danh sách challenge",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Challenge" } } } },
          },
        },
      },
    },

    "/challenges/{id}/join": {
      post: {
        tags: ["Challenges"],
        summary: "Tham gia một challenge",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          201: { description: "Tham gia thành công", content: { "application/json": { schema: { $ref: "#/components/schemas/UserChallenge" } } } },
          400: { description: "Đã tham gia hoặc challenge không hợp lệ", content: { "application/json": { schema: { $ref: "#/components/schemas/Message" } } } },
          404: { description: "Challenge không tồn tại", content: { "application/json": { schema: { $ref: "#/components/schemas/Message" } } } },
        },
      },
    },

    "/challenges/my-challenges": {
      get: {
        tags: ["Challenges"],
        summary: "Danh sách challenge user đã tham gia",
        responses: {
          200: { description: "Danh sách challenge của user", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/UserChallenge" } } } } },
        },
      },
    },

    "/challenges/my-challenges/{id}/check-in": {
      post: {
        tags: ["Challenges"],
        summary: "Check-in một ngày cho challenge đang tham gia",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Check-in thành công", content: { "application/json": { schema: { $ref: "#/components/schemas/UserChallenge" } } } },
          400: { description: "Không thể check-in (đã check hoặc không ACTIVE)", content: { "application/json": { schema: { $ref: "#/components/schemas/Message" } } } },
          404: { description: "Không tìm thấy challenge", content: { "application/json": { schema: { $ref: "#/components/schemas/Message" } } } },
        },
      },
    },

    "/challenges/my-challenges/{id}": {
      delete: {
        tags: ["Challenges"],
        summary: "Huỷ tham gia một challenge",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Đã huỷ", content: { "application/json": { schema: { $ref: "#/components/schemas/Message" } } } },
          404: { description: "Không tìm thấy challenge", content: { "application/json": { schema: { $ref: "#/components/schemas/Message" } } } },
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
                  displayName: { type: "string", description: "Tên hiển thị (tuỳ chọn, nếu không có sẽ dùng name)" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Cập nhật thành công", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
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
          200: { description: "Đã xoá tài khoản", content: { "application/json": { schema: { $ref: "#/components/schemas/Message" } } } },
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
