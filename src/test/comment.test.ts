import request from "supertest";
import app from "../server";
import mongoose from "mongoose";
import { describe, it, beforeAll, expect, jest } from "@jest/globals";

jest.setTimeout(100000);

let accessTokenHost: string;
let accessTokenUser: string;
let postId: mongoose.Types.ObjectId;
let commentId: string;
let hostUserId: string;
let userUserId: string;

describe("Comment Endpoints", () => {
    beforeAll(async () => {
        // Log in the host user
        const loginHostRes = await request(app)
            .post("/user/login")
            .send({
                email: "HostTestUser@gnail.com",
                password: "123456",
            });
        accessTokenHost = loginHostRes.body.accessToken;
        hostUserId = loginHostRes.body.id;

        // Log in the regular user
        const loginUserRes = await request(app)
            .post("/user/login")
            .send({
                email: "RegularTestUser@gnail.com",
                password: "123456",
            });
        accessTokenUser = loginUserRes.body.accessToken;
        userUserId = loginUserRes.body.id;

        // Create a new post
        const resPost = await request(app)
            .post("/post/create")
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
    });

    it("should create a new comment", async () => {
        const res = await request(app)
            .post(`/comment/create/${postId}`)
            .set("Authorization", `Bearer ${accessTokenUser}`)
            .send({
                postId: postId,
                content: "Test Comment",
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.comment.content).toEqual("Test Comment");
        commentId = res.body.comment._id;
    });

    it("should fail if postId is missing", async () => {
        const res = await request(app)
            .post(`/comment/create/` + postId) // Send request without postId
            .set("Authorization", `Bearer ${accessTokenHost}`)
            .send({
                content: "This is a test comment without a postId", // Only send content
            });
    
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual("Post ID is required");
    });

    it("should return 400 if postId is missing", async () => {
        const res = await request(app)
            .get(`/comment/postId/`) // Missing postId in the URL
            .set("Authorization", `Bearer ${accessTokenHost}`);
    
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual("Post ID is required");
    });
    
    it("should return 404 if the post does not exist", async () => {
        const fakePostId = new mongoose.Types.ObjectId(); // Non-existent post ID
    
        const res = await request(app)
            .get(`/comment/postId/${fakePostId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`);
    
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual("Post not found");
    });
    
    it("should return 404 if no comments exist for the specified post", async () => {
        const newPostRes = await request(app)
            .post("/post/create")
            .set("Authorization", `Bearer ${accessTokenHost}`)
            .send({
                date: "12/12/2050",
                time: "09:00",
                minimumWaveHeight: 1.0,
                maximumWaveHeight: 2.0,
                averageWindSpeed: 10,
                description: "Post with no comments",
            });
        const newPostId = newPostRes.body.post._id;
    
        const res = await request(app)
            .get(`/comment/postId/${newPostId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`);
    
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual("No comments found for this post");
    });
    
    it("should return all comments for a specific post", async () => {
        // Create a new comment for the post
        await request(app)
            .post(`/comment/create/${postId}`)
            .set("Authorization", `Bearer ${accessTokenUser}`)
            .send({
                postId: postId,
                content: "Test Comment for Post",
            });
    
        const res = await request(app)
            .get(`/comment/postId/${postId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`);
    
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body.some((comment: any) => comment.postId === postId.toString())).toBeTruthy();
    });

    it("should retrieve a comment by its ID", async () => {
        const res = await request(app)
            .get(`/comment/commentId/${commentId}`) // Use a valid commentId
            .set("Authorization", `Bearer ${accessTokenHost}`); // Ensure Authorization is provided
    
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("_id", commentId); // Ensure the response includes the correct ID
        expect(res.body).toHaveProperty("content");
        expect(res.body).toHaveProperty("postId");
    });
    
    it("should fail if the comment does not exist", async () => {
        const fakeCommentId = new mongoose.Types.ObjectId(); // Generate a non-existent comment ID
    
        const res = await request(app)
            .get(`/comment/commentId/${fakeCommentId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`);
    
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual("Comment not found"); // Ensure correct error message
    });

    it("shude fail if thete is no comments for a specific post", async () => {
        const newPostRes = await request(app)
            .post("/post/create")
            .set("Authorization", `Bearer ${accessTokenHost}`)
            .send({
                date: "12/12/2050",
                time: "09:00",
                minimumWaveHeight: 1.0,
                maximumWaveHeight: 2.0,
                averageWindSpeed: 10,
                description: "Post with no comments",
            });
        const newPostId = newPostRes.body.post._id;
    
        const res = await request(app)
            .get(`/comment/postId/${newPostId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`);
    
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual("No comments found for this post");
    });

    it("should fail if content is missing", async () => {
        const res = await request(app)
            .post(`/comment/create/${postId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`)
            .send({ postId: postId });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual("Content is required");
    });

    it("should fail if post does not exist", async () => {
        const fakePostId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .post(`/comment/create/${fakePostId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`)
            .send({
                postId: fakePostId,
                content: "Comment for non-existent post",
            });

        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual("Post not found");
    });

    it("should retrieve a comment by its ID", async () => {
        const res = await request(app)
            .get(`/comment/commentId/${commentId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.content).toEqual("Test Comment");
        expect(res.body.postId).toEqual(postId.toString());
    });

    it("should get all comments for a specific post", async () => {
        const res = await request(app)
            .get(`/comment/postId/${postId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body.some((comment: any) => comment._id === commentId)).toBeTruthy();
    });

    it("should fail if no comments exist for a specific post", async () => {
        const newPostRes = await request(app)
            .post("/post/create")
            .set("Authorization", `Bearer ${accessTokenHost}`)
            .send({
                date: "12/12/2050",
                time: "09:00",
                minimumWaveHeight: 1.0,
                maximumWaveHeight: 2.0,
                averageWindSpeed: 10,
                description: "Post with no comments",
            });
        const newPostId = newPostRes.body.post._id;

        const res = await request(app)
            .get(`/comment/postId/${newPostId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual("No comments found for this post");
    });

    it("should fail if the user is not the author of the comment", async () => {
        const res = await request(app)
            .put(`/comment/update/${commentId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`)
            .send({ content: "Unauthorized update" });

        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toEqual("Unauthorized to update this comment");
    });

    it("should fail if the comment does not exist", async () => {
        const fakeCommentId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .put(`/comment/update/${fakeCommentId}`)
            .set("Authorization", `Bearer ${accessTokenUser}`)
            .send({ content: "Updated Test Comment" });

        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual("Comment not found");
    });

    

    it("should return all comments for a specific user", async () => {
        const res = await request(app)
            .get(`/comment/userId/${hostUserId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
        res.body.forEach((comment: any) => {
            expect(comment.userId).toEqual(hostUserId);
        });
    });


    it("should return 404 if the user has no comments", async () => {
        const noCommentUserId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .get(`/comment/userId/${noCommentUserId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual("No comments found for this user");
    });

    it("should return 403 if the user is not the author of the comment", async () => {
        const res = await request(app)
            .delete(`/comment/delete/${commentId}`) 
            .set("Authorization", `Bearer ${accessTokenHost}`); 
    
        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toEqual("Unauthorized to delete this comment");
    });

    console.log("commentId:", commentId);

    // it("should delete a comment successfully", async () => {
    //     const res = await request(app)
    //         .delete(`/comment/delete/${commentId}`) 
    //         .set("Authorization", `Bearer ${accessTokenUser}`); // Ensure the user is the comment's author
    
    //     expect(res.statusCode).toEqual(200);
    //     expect(res.body.message).toEqual("Comment deleted successfully");
    // });

    it("should return 404 if the comment does not exist", async () => {
        const fakeCommentId = new mongoose.Types.ObjectId(); // Generate a non-existent comment ID
    
        const res = await request(app)
            .delete(`/comment/delete/${fakeCommentId}`)
            .set("Authorization", `Bearer ${accessTokenUser}`);
    
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual("Comment not found");
    });


    // it("should return 400 if the commentId is invalid", async () => {
    //     const invalidCommentId = "12345"; // Invalid ID format
    
    //     const res = await request(app)
    //         .delete(`/comment/delete/${invalidCommentId}`)
    //         .set("Authorization", `Bearer ${accessTokenUser}`);
    
    //     expect(res.statusCode).toEqual(400);
    //     expect(res.body.message).toEqual("Invalid Comment ID");
    // });
    
    // it("should return 401 if no Authorization token is provided", async () => {
    //     const res = await request(app)
    //         .delete(`/comment/delete/${commentId}`); // Valid commentId but no Authorization token
    
    //     expect(res.statusCode).toEqual(401);
    //     expect(res.body.message).toEqual("Not authorized, no token");
    // });
    
  
    
    
    

});

