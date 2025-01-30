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
            schema: {
              type: "object",
              properties: {
                firstName: { type: "string", example: "John" },
                lastName: { type: "string", example: "Doe" },
                email: { type: "string", example: "johndoe@gmail.com" },
                password: { type: "string", example: "strongPassword123!" },
                role: { type: "string", example: "Instructor" },
                profilePicture: { type: "string", format: "binary" },
              },
              required: ["firstName", "lastName", "email", "password"],
            },
          },
        },
      },
      responses: {
        201: { description: "User registered successfully" },
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
        200: { description: "User logged in successfully" },
        401: { description: "Invalid email or password" },
      },
    },
  },

  "/user/logout": {
    post: {
      summary: "Logout a user",
      description: "Logs out the user by invalidating the refresh token",
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
        200: { description: "User logged out successfully" },
        400: { description: "Refresh token required" },
        403: { description: "Invalid or expired refresh token" },
      },
    },
  },

  "/user/update": {
    put: {
      summary: "Update user details",
      description:
        "Update authenticated user details including profile picture",
      tags: ["Users"],
      security: [{ bearerAuth: [] }],
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
                role: { type: "string", example: "Instructor" },
                description: {
                  type: "string",
                  example: "Surf instructor with 5 years of experience",
                },
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

  "/user/getUser/{id}": {
    get: {
      summary: "Get user by ID",
      description: "Retrieve user details by ID",
      tags: ["Users"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "The ID of the user",
        },
      ],
      responses: {
        200: {
          description: "User retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id: { type: "string", example: "60d0fe4f5311236168a109ca" },
                  firstName: { type: "string", example: "John" },
                  lastName: { type: "string", example: "Doe" },
                  email: { type: "string", example: "johndoe@gmail.com" },
                  role: { type: "string", example: "Instructor" },
                  description: { type: "string", example: "Surf instructor" },
                },
              },
            },
          },
        },
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
        404: { description: "Refresh token not found" },
      },
    },
  },

  "/user/activities": {
    get: {
      summary: "Get user activities",
      description: "Retrieve a list of user activities",
      tags: ["Users"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Activities retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    action: { type: "string", example: "Joined a surf event" },
                    timestamp: {
                      type: "string",
                      example: "2024-01-30T12:34:56Z",
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Access token required" },
      },
    },
  },

  "/user/googlelogin": {
    post: {
      summary: "Google login authentication",
      description: "Authenticate a user using Google OAuth2 login",
      tags: ["Users"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                code: { type: "string", example: "4/0AfJohX...M5Xx" },
              },
              required: ["code"],
            },
          },
        },
      },
      responses: {
        200: { description: "User authenticated successfully" },
        500: { description: "Failed to authenticate user" },
      },
    },
  },
};

export default userPaths;
