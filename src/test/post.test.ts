import request from "supertest";
import app from "../server";
import mongoose from "mongoose";
import Post from "../models/postModel";
import User from "../models/userModel";
import{convertIsraeliDateToDate} from "../controller/postController"
import { describe, it, beforeAll, expect, test, jest } from "@jest/globals";

process.env.NODE_ENV = "test";

jest.setTimeout(100000);
let accessTokenHost: string;
let accessTokenUser: string;
let postId: string;


describe("Post Endpoints", () => {

    beforeAll(async () => {
 
        // Log in the host user to retrieve the access token
        const loginHostRes = await request(app)
            .post("/user/login")
            .send({
                email: "HostTestUser@gnail.com",
                password: "123456",
            });
    
        accessTokenHost = loginHostRes.body.accessToken;
        
        // Log in the a rgular user (not a host)
        const loginUserRes = await request(app)
        .post("/user/login")
        .send({
            email: "RegularTestUser@gnail.com",
            password: "123456",
        });
        
        accessTokenUser = loginUserRes.body.accessToken;
    });

    it("should create a new post", async () => {
        const res = await request(app)
            .post("/post/create")
            .set("Authorization", `Bearer ${accessTokenHost}`)
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

        postId = res.body.post._id.toString(); // Save the post ID for future tests
    });

    it("should not create a new post becuse the user is not a host", async () => {
        const res = await request(app)
            .post("/post/create")
            .set("Authorization", `Bearer ${accessTokenUser}`)
            .send({
                date: "01/10/2026",
                time: "08:00",
                minimumWaveHeight: 1.5,
                maximumWaveHeight: 3.0,
                averageWindSpeed: 15,
                description: "This post shuld not post",
            });

        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toBe("Only hosts can create posts");

    });

    it("should fail to create a post with missing fields", async () => {
        const res = await request(app)
            .post("/post/create")
            .set("Authorization", `Bearer ${accessTokenHost}`)
            .send({
                date: "01/10/2025",
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe("All fields are required");
    });

    it("should get all posts", async () => {
        const res = await request(app)
        .get("/post/getAll")
        .set("Authorization", `Bearer ${accessTokenHost}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it("should get a post by ID", async () => {
        const res = await request(app)
         .get(`/post/getById/${postId}`)
         .set("Authorization", `Bearer ${accessTokenHost}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("_id");
        expect(res.body._id).toBe(postId);
    });

    it("should fail when the post is not found by ID", async () => {
        const nonExistentPostId = "64c8f4e1b2d8b1c1e6a39e99";
    
        const res = await request(app)
            .get(`/post/getById/${nonExistentPostId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`);
    
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Post not found");
    });
    

    it("should update a post", async () => {
        const res = await request(app)
            .put(`/post/update/${postId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`)
            .send({
                description: "Updated description",
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.updatedPost.description).toBe("Updated description");
    });
    
    it("should fail to update a post if not host", async () => {
        const res = await request(app)
            .put(`/post/update/${postId}`)
            .set("Authorization", `Bearer ${accessTokenUser}`)
            .send({
                description: "Attempted update",
            });

        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toBe("Only hosts can update posts");
    });

    it("should fail when trying to update a non-existent post", async () => {
        const nonExistentPostId = "64c8f4e1b2d8b1c1e6a39e99"; 
    
        const res = await request(app)
            .put(`/post/update/${nonExistentPostId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`)
            .send({
                description: "Updated description for non-existent post",
            });
    
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Post not found");
    });
    

    it("should get only future posts", async () => {
        await request(app)
            .post("/post/create")
            .set("Authorization", `Bearer ${accessTokenHost}`)
            .send({
                date: "01/01/2020", // Past date
                time: "10:00",
                minimumWaveHeight: 1.0,
                maximumWaveHeight: 2.5,
                averageWindSpeed: 10,
                description: "Past surfing event",
            });
    
        const futurePost = await request(app)
            .post("/post/create")
            .set("Authorization", `Bearer ${accessTokenHost}`)
            .send({
                date: "01/01/2030", // Future date
                time: "14:00",
                minimumWaveHeight: 1.8,
                maximumWaveHeight: 3.0,
                averageWindSpeed: 12,
                description: "Future surfing event",
            });
    
        const res = await request(app)
            .get("/post/futurePosts")
            .set("Authorization", `Bearer ${accessTokenHost}`);
    
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ description: "Future surfing event" }),
            ])
        );
        expect(res.body).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({ description: "Past surfing event" }),
            ])
        );
    });

    it("should like a post", async () => {
        const res = await request(app)
            .post(`/post/like/${postId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe("Post liked successfully");
        expect(res.body.likeCount).toBeGreaterThan(0);
    });

    it("should remove a like if the user already liked the post", async () => {
        const res = await request(app)
            .post(`/post/like/${postId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`);
    
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe("Like removed successfully");
    });
    

    it("should fail when trying to like a non-existent post", async () => {
        const nonExistentPostId = "64c8f4e1b2d8b1c1e6a39e99"; 
    
        const res = await request(app)
            .post(`/post/like/${nonExistentPostId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`);
    
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Post not found");
    });

    it("should join a post", async () => {
        const res = await request(app)
            .post(`/post/join/${postId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe("Participation confirmed successfully");
        expect(res.body.participantCount).toBeGreaterThan(0);
    });

    it("should remove the user from participants if already joined", async () => {
        const res = await request(app)
            .post(`/post/join/${postId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`);
    
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Participation removed successfully");
    });

    it("should fail when trying to join a non-existent post", async () => {
        const nonExistentPostId = "64c8f4e1b2d8b1c1e6a39e99"; 
    
        const res = await request(app)
            .post(`/post/join/${nonExistentPostId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`);
    
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Post not found");
    });

    it("should fail to delete a post if not host", async () => {
        const res = await request(app)
            .delete(`/post/delete/${postId}`)
            .set("Authorization", `Bearer ${accessTokenUser}`);
        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toBe("Only hosts can delete posts");
    });

    it("should delete a post", async () => {
        const res = await request(app)
            .delete(`/post/delete/${postId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe("Post deleted successfully");
    });

    it("should fail when trying to delete a non-existent post", async () => {
        const nonExistentPostId = "64c8f4e1b2d8b1c1e6a39e99"; 
    
        const res = await request(app)
            .delete(`/post/delete/${nonExistentPostId}`)
            .set("Authorization", `Bearer ${accessTokenHost}`);
    
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Post not found");
    });
    
    it("should convert a valid Israeli date to a Mongo date format", () => {
        const dateString = "15/08/2023"; // DD/MM/YYYY
        const result = convertIsraeliDateToDate(dateString);
        
        expect(result).toBeInstanceOf(Date);
        expect(result?.toISOString().startsWith("2023-08-15")).toBeTruthy();
    });

    it("should throw an error for an invalid date format", () => {
        const invalidDate = "2023/08/15"; // Invalid format
        
        expect(() => convertIsraeliDateToDate(invalidDate)).toThrow(
            "Invalid date format. Expected format: DD/MM/YYYY"
        );
    });
    
    it("should return null for an empty date string", () => {
        const result = convertIsraeliDateToDate("");
        expect(result).toBeNull();
    });
    
    it("should throw an error for a non-date value", () => {
        const nonDate = "invalid-date";
    
        expect(() => convertIsraeliDateToDate(nonDate)).toThrow(
            "Invalid date format. Expected format: DD/MM/YYYY"
        );
    });
});