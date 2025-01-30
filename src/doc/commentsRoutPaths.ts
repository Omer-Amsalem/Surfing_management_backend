const commentsPaths = {
    "/comment/create/{postId}": {
      post: {
        summary: "Create a new comment",
        description:
          "Adds a comment to a specific post. Requires authentication.",
        tags: ["Comments"],
        security: [{ bearerAuth: [] }], // Requires JWT token
        parameters: [
          {
            name: "postId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "The ID of the post to comment on",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  content: { type: "string", example: "Great post!" },
                },
                required: ["content"],
              },
            },
          },
        },
        responses: {
          201: { description: "Comment created successfully" },
          400: { description: "Post ID is required or content is missing" },
          404: { description: "Post not found" },
        },
      },
    },
  
    "/comment/postId/{postId}": {
      get: {
        summary: "Get comments by post ID",
        description: "Retrieve all comments for a specific post.",
        tags: ["Comments"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "postId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "The ID of the post to retrieve comments for",
          },
        ],
        responses: {
          200: {
            description: "List of comments",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Comment" },
                },
              },
            },
          },
          400: { description: "Post ID is required" },
          404: { description: "Post not found" },
        },
      },
    },
  
    "/comment/commentId/{commentId}": {
      get: {
        summary: "Get a comment by its ID",
        description: "Retrieve a single comment by its ID.",
        tags: ["Comments"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "commentId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "The ID of the comment",
          },
        ],
        responses: {
          200: {
            description: "Comment retrieved successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Comment" },
              },
            },
          },
          400: { description: "Invalid comment ID" },
          404: { description: "Comment not found" },
        },
      },
    },
  
    "/comment/userId/{userId}": {
      get: {
        summary: "Get comments by user ID",
        description: "Retrieve all comments made by a specific user.",
        tags: ["Comments"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "The ID of the user",
          },
        ],
        responses: {
          200: {
            description: "List of user's comments",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Comment" },
                },
              },
            },
          },
          404: { description: "No comments found for this user" },
        },
      },
    },
  
    "/comment/update/{commentId}": {
      put: {
        summary: "Update a comment",
        description: "Updates a comment's content. Requires authentication.",
        tags: ["Comments"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "commentId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "The ID of the comment to update",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  content: { type: "string", example: "Updated comment text" },
                },
                required: ["content"],
              },
            },
          },
        },
        responses: {
          200: { description: "Comment updated successfully" },
          403: { description: "Unauthorized to update this comment" },
          404: { description: "Comment not found" },
        },
      },
    },
  
    "/comment/delete/{commentId}": {
      delete: {
        summary: "Delete a comment",
        description: "Deletes a comment by its ID. Requires authentication.",
        tags: ["Comments"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "commentId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "The ID of the comment to delete",
          },
        ],
        responses: {
          200: { description: "Comment deleted successfully" },
          403: { description: "Unauthorized to delete this comment" },
          404: { description: "Comment not found" },
        },
      },
    },
  
    "/comment/deleteAll/{postId}": {
      delete: {
        summary: "Delete all comments for a post",
        description:
          "Deletes all comments for a given post. Only hosts can perform this action.",
        tags: ["Comments"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "postId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "The ID of the post",
          },
        ],
        responses: {
          200: { description: "All comments deleted successfully" },
          403: {
            description: "Unauthorized: Only hosts can perform this action",
          },
          404: { description: "Post not found" },
        },
      },
    },
  };
  
  export default commentsPaths;
  