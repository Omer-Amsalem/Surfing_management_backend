import request from "supertest";
import app from "../server";
import mongoose from "mongoose";
import { describe, it, beforeAll, afterAll, expect, jest } from "@jest/globals";
import Post from "../models/postModel";

jest.setTimeout(100000);

const DUMMY_CONTENT = "Test Comment";
const INVALID_ID = new mongoose.Types.ObjectId();
const MISSING_POST_ID = "";

let accessTokenHost: string;
let accessTokenUser: string;
let postId: mongoose.Types.ObjectId;
let postIdWithoutComments: mongoose.Types.ObjectId;
let userCommentId: string;
let hostUserId: string;
let userId: string;
let testPostIds: string[] = [];

describe("Comment Endpoints", () => {
  beforeAll(async () => {
    const loginHostRes = await request(app)
      .post("/user/login")
      .send({ email: "HostTestUser@gnail.com", password: "123456" });
    accessTokenHost = loginHostRes.body.accessToken;
    hostUserId = loginHostRes.body.id;

    const loginUserRes = await request(app)
      .post("/user/login")
      .send({ email: "RegularTestUser@gnail.com", password: "123456" });
    accessTokenUser = loginUserRes.body.accessToken;
    userId = loginUserRes.body.id;

    const resPost = await request(app)
      .post("/post/create/")
      .set("Authorization", `Bearer ${accessTokenHost}`)
      .send({
        date: "10/10/2050",
        time: "08:00",
        minimumWaveHeight: 1.5,
        maximumWaveHeight: 3.0,
        averageWindSpeed: 15,
        description: "Test Post for Comments",
      });
    postId = resPost.body.post._id;
    testPostIds.push(postId.toString());

    const resPostWithoutComments = await request(app)
      .post("/post/create/")
      .set("Authorization", `Bearer ${accessTokenHost}`)
      .send({
        date: "12/12/2050",
        time: "09:00",
        minimumWaveHeight: 1.0,
        maximumWaveHeight: 2.0,
        averageWindSpeed: 10,
        description: "Post with no comments",
      });
    postIdWithoutComments = resPostWithoutComments.body.post._id;
    testPostIds.push(postIdWithoutComments.toString());
  });

  describe("POST /comment/create/:postId", () => {
    it("should create a new comment successfully", async () => {
      const res = await request(app)
        .post(`/comment/create/${postId}`)
        .set("Authorization", `Bearer ${accessTokenUser}`)
        .send({ content: DUMMY_CONTENT });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Comment created successfully");
      expect(res.body.comment.content).toBe(DUMMY_CONTENT);
      userCommentId = res.body.comment._id;
    });

    it("should fail if postId is missing", async () => {
      const res = await request(app)
        .post(`/comment/create/${MISSING_POST_ID}`)
        .set("Authorization", `Bearer ${accessTokenUser}`)
        .send({ content: DUMMY_CONTENT });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Post ID is required");
    });

    it("should fail if content is missing", async () => {
      const res = await request(app)
        .post(`/comment/create/${postId}`)
        .set("Authorization", `Bearer ${accessTokenUser}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Content is required");
    });

    it("should fail if the post does not exist", async () => {
      const res = await request(app)
        .post(`/comment/create/${INVALID_ID}`)
        .set("Authorization", `Bearer ${accessTokenUser}`)
        .send({ content: DUMMY_CONTENT });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Post not found");
    });
  });

  describe("GET /comment/postId/:postId?", () => {
    it("should return all comments for a specific post", async () => {
      const res = await request(app)
        .get(`/comment/postId/${postId}`)
        .set("Authorization", `Bearer ${accessTokenHost}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.comments)).toBeTruthy();
      expect(res.body.comments.length).toBeGreaterThan(0);
    });

    it("should return an empty array if no comments are found for the post", async () => {
      const res = await request(app)
        .get(`/comment/postId/${postIdWithoutComments}`)
        .set("Authorization", `Bearer ${accessTokenHost}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.comments)).toBeTruthy();
      expect(res.body.comments.length).toBe(0);
      expect(res.body.message).toBe("No comments found for this post.");
    });

    it("should return 400 if postId is missing", async () => {
      const res = await request(app)
        .get(`/comment/postId/${MISSING_POST_ID}`)
        .set("Authorization", `Bearer ${accessTokenHost}`);

      expect(res.status).toBe(404);
    });
  });

  it("should return 404 if the post does not exist", async () => {
    const fakePostId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .get(`/comment/postId/${fakePostId}`)
      .set("Authorization", `Bearer ${accessTokenHost}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Post not found");
  });

  describe("GET /comment/commentId/:commentId?", () => {
    it("should retrieve a comment by its ID successfully", async () => {
      const res = await request(app)
        .get(`/comment/commentId/${userCommentId}`)
        .set("Authorization", `Bearer ${accessTokenUser}`);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(userCommentId);
    });

    it("should return 400 if commentId is missing or empty", async () => {
      const res = await request(app)
        .get(`/comment/commentId/`)
        .set("Authorization", `Bearer ${accessTokenUser}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Comment ID is required");
    });

    it("should return 400 if commentId is invalid", async () => {
      const invalidCommentId = "invalid-id";
      const res = await request(app)
        .get(`/comment/commentId/${invalidCommentId}`)
        .set("Authorization", `Bearer ${accessTokenUser}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid Comment ID");
    });

    it("should return 404 if the comment does not exist", async () => {
      const fakeCommentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/comment/commentId/${fakeCommentId}`)
        .set("Authorization", `Bearer ${accessTokenUser}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Comment not found");
    });

    it("should return 400 if commentId is missing", async () => {
      const res = await request(app)
        .get(`/comment/commentId/`)
        .set("Authorization", `Bearer ${accessTokenUser}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Comment ID is required");
    });
  });

  describe("GET /comment/userId/:userId", () => {
    it("should return all comments by a specific user successfully", async () => {
      const res = await request(app)
        .get(`/comment/userId/${userId}`)
        .set("Authorization", `Bearer ${accessTokenUser}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("should return 404 if the user has no comments", async () => {
      const newUserId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/comment/userId/${newUserId}`)
        .set("Authorization", `Bearer ${accessTokenHost}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("No comments found for this user");
    });

    it("should return 404 if userId is missing", async () => {
      const res = await request(app)
        .get(`/comment/userId/`)
        .set("Authorization", `Bearer ${accessTokenHost}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("No comments found for this user");
    });
  });

  describe("PUT /comment/update/:commentId", () => {
    it("should update a comment successfully", async () => {
      const res = await request(app)
        .put(`/comment/update/${userCommentId}`)
        .set("Authorization", `Bearer ${accessTokenUser}`)
        .send({ content: "Updated content" });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Comment updated successfully");
      expect(res.body.comment.content).toBe("Updated content");
    });

    it("should return 404 if the comment does not exist", async () => {
      const fakeCommentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/comment/update/${fakeCommentId}`)
        .set("Authorization", `Bearer ${accessTokenUser}`)
        .send({ content: "Updated content" });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Comment not found");
    });

    it("should return 403 if the user is not the author of the comment", async () => {
      const res = await request(app)
        .put(`/comment/update/${userCommentId}`)
        .set("Authorization", `Bearer ${accessTokenHost}`)
        .send({ content: "Unauthorized update" });

      expect(res.status).toBe(403); // מצפה לסטטוס 403
      expect(res.body.message).toBe("Unauthorized to update this comment");
    });

    it("should return 400 if content is missing", async () => {
      const res = await request(app)
        .put(`/comment/update/${userCommentId}`)
        .set("Authorization", `Bearer ${accessTokenUser}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Content is required");
    });
  });

  describe("DELETE /comment/delete/:commentId", () => {
    it("should fail if the user is not the author of the comment", async () => {
      const res = await request(app)
        .delete(`/comment/delete/${userCommentId}`)
        .set("Authorization", `Bearer ${accessTokenHost}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Unauthorized to delete this comment");
    });

    it("should delete a comment successfully", async () => {
      const res = await request(app)
        .delete(`/comment/delete/${userCommentId}`)
        .set("Authorization", `Bearer ${accessTokenUser}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Comment deleted successfully");
    });

    it("should fail if the comment does not exist", async () => {
      const res = await request(app)
        .delete(`/comment/delete/${INVALID_ID}`)
        .set("Authorization", `Bearer ${accessTokenUser}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Comment not found");
    });
  });

  describe("DELETE /comment/deleteAll/:postId", () => {
    it("should delete all comments for a specific post", async () => {
      const res = await request(app)
        .delete(`/comment/deleteAll/${postId}`)
        .set("Authorization", `Bearer ${accessTokenHost}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("All comments deleted successfully");
    });

    it("should fail if the user is not a host", async () => {
      const res = await request(app)
        .delete(`/comment/deleteAll/${postId}`)
        .set("Authorization", `Bearer ${accessTokenUser}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe(
        "Unauthorized: Only hosts can perform this action"
      );
    });

    it("should fail if the post does not exist", async () => {
      const res = await request(app)
        .delete(`/comment/deleteAll/${INVALID_ID}`)
        .set("Authorization", `Bearer ${accessTokenHost}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Post not found");
    });
  });
  
  afterAll(async () => {
    console.log("Cleaning up test posts on comment.test.ts...");
    try {
      if (testPostIds.length > 0) {
        const result = await Post.deleteMany({ _id: { $in: testPostIds } });
        console.log(`Deleted ${result.deletedCount} test posts.`);
      } else {
        console.log("No test posts to delete.");
      }
    } catch (error) {
      console.error("Error during test post cleanup:", error);
    }

    await mongoose.connection.close();
  });});
