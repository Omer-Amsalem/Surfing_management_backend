import request from "supertest";
import app from "../server";
import mongoose from "mongoose";
import Post from "../models/postModel";
import User from "../models/userModel";
import { describe, it, beforeAll, expect, test, jest } from "@jest/globals";

process.env.NODE_ENV = "test";

jest.setTimeout(10000);
let accessToken: string;
let postId: string;


describe("Post Endpoints", () => {

    beforeAll(async () => {
 
        // Log in the host user to retrieve the access token
        const loginRes = await request(app)
            .post("/user/login")
            .send({
                email: "postTestUser@gnail.com",
                password: "123456",
            });
    
        accessToken = loginRes.body.accessToken;
    });

    it("should create a new post", async () => {
        const res = await request(app)
            .post("/post/create")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                date: "01/10/2025",
                time: "10:00",
                minimumWaveHeight: 1.5,
                maximumWaveHeight: 3.0,
                averageWindSpeed: 15,
                description: "Hi colman, great surfing day!",
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.post).toHaveProperty("_id");
        postId = res.body.post._id  ; // Save the post ID for future tests
    });

    console.log("postId:",postId);

    it("should fail to create a post with missing fields", async () => {
        const res = await request(app)
            .post("/post/create")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                date: "01/10/2025",
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe("All fields are required");
    });

    it("should get all posts", async () => {
        const res = await request(app)
        .get("/post/getAll")
        .set("Authorization", `Bearer ${accessToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it("should get a post by ID", async () => {
        const res = await request(app)
         .get(`/getById/${postId}`)
         .set("Authorization", `Bearer ${accessToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("_id");
        expect(res.body._id).toBe(postId);
    });

    it("should update a post", async () => {
        const res = await request(app)
            .put(`/post/update/${postId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                description: "Updated description",
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.updatedPost.description).toBe("Updated description");
    });
    
    it("should fail to update a post if not host", async () => {
        const res = await request(app)
            .put(`/post/update/${postId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                description: "Attempted update",
            });

        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toBe("Only hosts can update posts");
    });


    it("should like a post", async () => {
        const res = await request(app)
            .post(`/post/like/${postId}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe("Post liked successfully");
        expect(res.body.likeCount).toBeGreaterThan(0);
    });

    it("should join a post", async () => {
        const res = await request(app)
            .post(`/post/join/${postId}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe("Participation confirmed successfully");
        expect(res.body.participantCount).toBeGreaterThan(0);
    });

    // it("should delete a post", async () => {
    //     const res = await request(app)
    //         .delete(`/post/delete/${postId}`)
    //         .set("Authorization", `Bearer ${accessToken}`);

    //     expect(res.statusCode).toEqual(200);
    //     expect(res.body.message).toBe("Post deleted successfully");
    // });

    // it("should fail to delete a post if not host", async () => {
    //     const res = await request(app)
    //     .set("Authorization", `Bearer ${accessToken}`)
    //     .delete(`/post/delete/${postId}`);
    //     expect(res.statusCode).toEqual(403);
    //     expect(res.body.message).toBe("Only hosts can delete posts");
    // });
});

// afterAll(async () => {
//     // Close the database connection after all tests
//     await mongoose.connection.close();
// });