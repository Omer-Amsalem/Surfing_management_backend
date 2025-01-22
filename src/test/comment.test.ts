import request from "supertest";
import app from "../server";
import mongoose from "mongoose";
import { describe, it, beforeAll, expect, jest } from "@jest/globals";

jest.setTimeout(100000);

let accessTokenHost: string;
let accessTokenUser: string;
let postId: mongoose.Types.ObjectId;
let userCommentId: string;
let hostUserId: string;
let userId: string;
let postIdWhidoutComments: mongoose.Types.ObjectId;

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
        userId = loginUserRes.body.id;

        // Create a new post
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
    postIdWhidoutComments = newPostRes.body.post._id;
    });

    it("should create a new comment", async () => {
        const res = await request(app)
            .post(`/comment/create/${postId}`)
            .set("Authorization", `Bearer ${accessTokenUser}`)
            .send({
                content: "Test Comment",
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.comment.content).toEqual("Test Comment");
        userCommentId = res.body.comment._id;
    });

    it("should fail if postId is missing", async () => {
        const res = await request(app)
            .post(`/comment/create/${""}`) // Send request without postId
            .set("Authorization", `Bearer ${accessTokenHost}`)
            .send({
                content: "This is a test comment without a postId", // Only send content
            });
    
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual("Post ID is required");
    });

    it("should fail if content is missing", async () => {
        const res = await request(app)
            .post(`/comment/create/${postId}`)
            .set("Authorization", `Bearer ${accessTokenUser}`)
            .send({ postId: postId }); // Send request without content
    
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual("Content is required");
    });

    it("should return 404 if the post does not exist", async () => {
        const fakePostId = new mongoose.Types.ObjectId(); // Non-existent post ID
    
        const res = await request(app)
            .get(`/comment/postId/${fakePostId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`);
    
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual("Post not found");
    });

    it("should return all comments for a specific post", async () => {
        const res = await request(app)
            .get(`/comment/postId/${postId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`);
    
        expect(res.statusCode).toEqual(200);
    });

    it("should return 400 if postId is missing in the request", async () => {
        const res = await request(app)
            .get(`/comment/postId/`)
            .set("Authorization", `Bearer ${accessTokenHost}`); 
    
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual("Post ID is required");
    });
    

    it("should get a comment by its ID", async () => {
        const res = await request(app)
            .get(`/comment/getById/${userCommentId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`); 
    
        expect(res.statusCode).toEqual(200);
    });
    
    it("should fail if the comment does not exist", async () => {
        const fakeCommentId = new mongoose.Types.ObjectId(); 
        const res = await request(app)
            .get(`/comment/commentId/${fakeCommentId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`);
    
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

    it("shude fail if there is no comments for a specific post", async () => {
        const res = await request(app)
            .get(`/comment/postId/${postIdWhidoutComments}`)
            .set("Authorization", `Bearer ${accessTokenHost}`);
    
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual("No comments found for this post");
    });

    it("should fail to create a comment if content is missing", async () => {
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

    it("should fail to update a comment if the user is not the author", async () => {
        const res = await request(app)
            .put(`/comment/update/${userCommentId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`)
            .send({ content: "Unauthorized update" });

        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toEqual("Unauthorized to update this comment");
    });


    it("should update an existing comment successfully", async () => {
        const res = await request(app)
            .put(`/comment/update/${userCommentId.toString()}`)
            .set("Authorization", `Bearer ${accessTokenUser}`)
            .send({ content: "Updated Test Comment" });

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual("Comment updated successfully");
    });

    it("should fail to update if the comment does not exist", async () => {
        const fakeCommentId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .put(`/comment/update/${fakeCommentId}`)
            .set("Authorization", `Bearer ${accessTokenUser}`)
            .send({ content: "Updated Test Comment" });

        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual("Comment not found");
    });

    it("should fail to update if content is missing", async () => {
        const res = await request(app)
            .put(`/comment/update/${userCommentId}`)
            .set("Authorization", `Bearer ${accessTokenUser}`)
            .send({});

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual("Content is required");
    });

    it("should return 404 if the user has no comments", async () => {
        const noCommentUserId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .get(`/comment/userId/${noCommentUserId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual("No comments found for this user");
    });

    it("shuld fail to delete a comment if the user is not the author", async () => {
        const res = await request(app)
            .delete(`/comment/delete/${userCommentId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`);

        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toEqual("Unauthorized to delete this comment");
    });

    it("should delete the existing comment successfully", async () => {
        const res = await request(app)
            .delete(`/comment/delete/${userCommentId}`)
            .set("Authorization", `Bearer ${accessTokenUser}`);
        
        console.log('Delete Response:', {
            statusCode: res.statusCode,
            body: res.body
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual("Comment deleted successfully");
    });

    it("should return 404 if the comment does not exist", async () => {
        const fakeCommentId = new mongoose.Types.ObjectId(); // Generate a non-existent comment ID
    
        const res = await request(app)
            .delete(`/comment/delete/${fakeCommentId}`)
            .set("Authorization", `Bearer ${accessTokenUser}`);
    
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual("Comment not found");
    });

    it("should return 403 if the user is not the author of the post", async () => {
        const res = await request(app)
            .delete(`/comment/deleteAll/${postId.toString()}`)
            .set("Authorization", `Bearer ${accessTokenUser}`); // User who did not create the post
    
        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toEqual("Unauthorized: Only hosts can perform this action");
    });

    it("should return 404 if the post does not exist", async () => {
        const fakePostId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .delete(`/comment/deleteAll/${fakePostId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`);
    
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual("Post not found");
    });
    
    it("should delete all comments for a specific post", async () => {
        const res = await request(app)
            .delete(`/comment/deleteAll/${postId.toString()}`)
            .set("Authorization", `Bearer ${accessTokenHost}`);
    
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual("All comments deleted successfully");
    });

});