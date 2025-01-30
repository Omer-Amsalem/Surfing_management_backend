const postPaths = {
  "/post/create": {
    post: {
      summary: "Create a new post",
      description:
        "Allows a host to create a new post with an optional photo upload.",
      tags: ["Posts"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                date: { type: "string", example: "01/10/2025" },
                time: { type: "string", example: "10:00" },
                minimumWaveHeight: { type: "number", example: 1.5 },
                maximumWaveHeight: { type: "number", example: 3.0 },
                averageWindSpeed: { type: "number", example: 15 },
                description: { type: "string", example: "Great surfing day!" },
                photo: { type: "string", format: "binary" },
              },
              required: [
                "date",
                "time",
                "minimumWaveHeight",
                "maximumWaveHeight",
                "averageWindSpeed",
                "description",
              ],
            },
          },
        },
      },
      responses: {
        201: { description: "Post created successfully" },
        403: { description: "Only hosts can create posts" },
        400: { description: "All fields are required" },
      },
    },
  },

  "/post/getAll": {
    get: {
      summary: "Get all posts",
      description: "Retrieves all posts available in the system.",
      tags: ["Posts"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "List of posts",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/Post" },
              },
            },
          },
        },
      },
    },
  },

  "/post/futurePosts": {
    get: {
      summary: "Get future posts",
      description: "Retrieves all future posts (posts with upcoming dates).",
      tags: ["Posts"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "List of future posts",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/Post" },
              },
            },
          },
        },
      },
    },
  },

  "/post/getById/{id}": {
    get: {
      summary: "Get a post by ID",
      description: "Retrieve a specific post by its ID.",
      tags: ["Posts"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "The ID of the post",
        },
      ],
      responses: {
        200: { description: "Post retrieved successfully" },
        404: { description: "Post not found" },
      },
    },
  },

  "/post/getParticipants/{id}": {
    get: {
      summary: "Get participants of a post",
      description: "Retrieve all users who joined a specific post.",
      tags: ["Posts"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "The ID of the post",
        },
      ],
      responses: {
        200: { description: "List of participants" },
        404: { description: "Post not found" },
      },
    },
  },

  "/post/update/{id}": {
    put: {
      summary: "Update a post",
      description: "Allows a host to update a post's details.",
      tags: ["Posts"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "The ID of the post",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                description: { type: "string", example: "Updated description" },
                photo: { type: "string", format: "binary" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Post updated successfully" },
        400: { description: "No update data provided" },
        403: { description: "Only hosts can update posts" },
        404: { description: "Post not found" },
      },
    },
  },

  "/post/like/{id}": {
    post: {
      summary: "Like a post",
      description: "Allows a user to like/unlike a post.",
      tags: ["Posts"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "The ID of the post",
        },
      ],
      responses: {
        200: { description: "Post liked/unliked successfully" },
        404: { description: "Post not found" },
      },
    },
  },

  "/post/join/{id}": {
    post: {
      summary: "Join a post",
      description: "Allows a user to join/leave a post.",
      tags: ["Posts"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "The ID of the post",
        },
      ],
      responses: {
        200: { description: "Joined/left the post successfully" },
        404: { description: "Post not found" },
      },
    },
  },

  "/post/delete/{id}": {
    delete: {
      summary: "Delete a post",
      description: "Allows a host to delete a post.",
      tags: ["Posts"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "The ID of the post",
        },
      ],
      responses: {
        200: { description: "Post deleted successfully" },
        403: { description: "Only hosts can delete posts" },
        404: { description: "Post not found" },
      },
    },
  },

  "/post/deleteAllLikes/{id}": {
    delete: {
      summary: "Delete all likes from a post",
      description: "Allows a host to remove all likes from a post.",
      tags: ["Posts"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "The ID of the post",
        },
      ],
      responses: {
        200: { description: "All likes removed successfully" },
        403: { description: "Only hosts can remove likes" },
        404: { description: "Post not found" },
      },
    },
  },

  "/post/deleteAllParticipants/{id}": {
    delete: {
      summary: "Delete all participants from a post",
      description: "Allows a host to remove all participants from a post.",
      tags: ["Posts"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "The ID of the post",
        },
      ],
      responses: {
        200: { description: "All participants removed successfully" },
        403: { description: "Only hosts can remove participants" },
        404: { description: "Post not found" },
      },
    },
  },
};

export default postPaths;
