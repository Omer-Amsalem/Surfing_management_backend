const userPaths = {
  "/user/register": {
    post: {
      summary: "Register a new user",
      description: "Creates a new user account with profile picture upload",
      tags: ["Users"],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            // we use multipart/form-data for file upload
            schema: {
              type: "object",
              properties: {
                firstName: { type: "string", example: "John" },
                lastName: { type: "string", example: "Doe" },
                email: { type: "string", example: "johndoe@gmail.com" },
                password: { type: "string", example: "strongPassword123!" },
                role: { type: "string", example: "Instructor" },
                profilePicture: { type: "string", format: "binary" }, // profile picture upload
              },
              required: ["firstName", "lastName", "email", "password"],
            },
          },
        },
      },
      responses: {
        201: {
          description: "User registered successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id: { type: "string", example: "60d0fe4f5311236168a109ca" },
                  message: {
                    type: "string",
                    example: "User created successfully",
                  },
                },
              },
            },
          },
        },
        400: { description: "Invalid input or user already exists" },
      },
    },
  },
  "/user/login": {
    post: {
      summary: "Login a user",
      description: "Authenticate a user and return a JWT token",
      tags: ["Users"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                email: { type: "string", example: "johndoe@gmail.com" },
                password: { type: "string", example: "strongPassword123!" },
              },
              required: ["email", "password"],
            },
          },
        },
      },
      responses: {
        200: {
          description: "User logged in successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  accessToken: {
                    type: "string",
                    example: "eyJhbGciOiJIUzI1Ni...",
                  },
                  refreshToken: {
                    type: "string",
                    example: "eyJhbGciOiJIUzI1Ni...",
                  },
                },
              },
            },
          },
        },
        401: { description: "Invalid email or password" },
      },
    },
  },
  "/user/update": {
    put: {
      summary: "Update user details",
      description:
        "Update authenticated user details including profile picture",
      tags: ["Users"],
      security: [{ bearerAuth: [] }], // JWT Authentication
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", example: "60d0fe4f5311236168a109ca" },
                firstName: { type: "string", example: "Moshe" },
                lastName: { type: "string", example: "Brosh" },
                profilePicture: { type: "string", format: "binary" },
              },
              required: ["id", "firstName", "lastName"],
            },
          },
        },
      },
      responses: {
        200: { description: "User updated successfully" },
        401: { description: "Access token required" },
        404: { description: "User not found" },
      },
    },
  },
  "/user/delete": {
    delete: {
      summary: "Delete a user",
      description: "Deletes an authenticated user",
      tags: ["Users"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", example: "60d0fe4f5311236168a109ca" },
              },
              required: ["id"],
            },
          },
        },
      },
      responses: {
        200: { description: "User deleted successfully" },
        401: { description: "Access token required" },
        404: { description: "User not found" },
      },
    },
  },
  "/user/refreshToken": {
    post: {
      summary: "Refresh authentication tokens",
      description: "Generate new access and refresh tokens",
      tags: ["Users"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                token: { type: "string", example: "eyJhbGciOiJIUzI1Ni..." },
              },
              required: ["token"],
            },
          },
        },
      },
      responses: {
        200: { description: "Tokens refreshed successfully" },
        403: { description: "Invalid or expired refresh token" },
      },
    },
  },
};

export default userPaths;
