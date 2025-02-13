import userPaths from "./userRoutPaths";
import postsPaths from "./postsRoutPaths";
import commentsPaths from "./commentsRoutPaths";
import chatPaths from "./chatRouts";
import Components from "./components";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Surf Club project - REST API documentation",
      version: "1.0.0",
      description:
        "This is a simple CRUD API application written in TypeScript, made with Express, Node.js, and documented with Swagger",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
    },
    servers: [{ url: "http://localhost:3000" }],
    tags: [
      {
        name: "Users",
        description: "The user Authentication API",
      },
      {
        name: "Posts",
        description: "The Posts API",
      },
      {
        name: "Comments",
        description: "The Comments API",
      },
    ],
    paths: { ...userPaths, ...postsPaths, ...commentsPaths, ...chatPaths },
    components: Components,
  },
  apis: ["./src/routes/*.ts"],
};

export default options;
