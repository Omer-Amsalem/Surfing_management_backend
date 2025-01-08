import request from "supertest";
import app from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import userModel from "../models/userModel";
import {generateAccessToken, generateRefreshToken} from "../middleWare/jwtMiddle";
import { describe, it, beforeAll, expect, test, jest } from "@jest/globals";

process.env.NODE_ENV = "test";

var userId: string;

jest.setTimeout(10000);


describe("User Endpoints", () => {
    let accessToken: string;
    let refreshToken: string;
    

    beforeAll(async () => {
        await userModel.deleteMany({});
        await request(app)
            .post("/user/register")
            .send({
                firstName: "Omer",
                lastName: "Smith",
                email: "Omer@gmail.com",
                password: "12345678",
                role: "Instructor",
                profilePicture: "https://pixabay.com/photos/man-elderly-indian-fisherman-6538205/"
            });
    });

    it("should register a user", async () => {
        const res = await request(app)
            .post("/user/register")
            .send({
                firstName: "Bar",
                lastName: "Larrea",
                email: "Bar@example.com",
                password: "Pass123456",
                role: "Instructor",
                profilePicture: "https://pixabay.com/photos/man-elderly-indian-fisherman-6538205/"
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body.user).toHaveProperty("_id");
        expect(res.body.user.email).toBe("Bar@example.com");
    });

    it("should fail to register a user same email", async () => {
        const res = await request(app)
            .post("/user/register")
            .send({
                firstName: "Yoni",
                lastName: "Motke",
                email: "Bar@example.com",
                password: "password123",
                role: "Instructor",
                profilePicture: "https://pixabay.com/photos/man-elderly-indian-fisherman-6538205/"
            });
        expect(res.statusCode).toEqual(400);
    });

    it("should fail to register a user with missing fields", async () => {
        const res = await request(app).post("/users/register").send({
            email: "Bar@example.com",
        });
        expect(res.statusCode).toEqual(404);
    });

    it("should login a user", async () => {
        const res = await request(app)
            .post("/user/login")
            .send({
                email: "Omer@gmail.com",
                password: "12345678"
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("accessToken");
        expect(res.body).toHaveProperty("refreshToken");
        accessToken = res.body.accessToken;
        refreshToken = res.body.refreshToken;
        userId = res.body.id;
        const user = await userModel.findByIdAndUpdate(userId, { refreshToken: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzYyZWVmMGQ4OTg5ODkyZWY3YTgzMTciLCJpYXQiOjE3MzQ2MzAxOTksImV4cCI6MTczNDYzMDQ5OX0.aIg7CGE6PRTT4UeYXh1pxQyAlUd3YA9jaAfi24hS3nU"] }, { new: true });
    });

    it("should fail login for invalid credentials", async () => {
        const res = await request(app)
            .post("/user/login")
            .send({
                email: "unknown@gmail.com",
                password: "invalidpassword"
            });
        expect(res.statusCode).toEqual(400);
    });

    
    it("should fail login for invalid email or password", async () => {
        const res = await request(app)
            .post("/user/login")
            .send({
                email: "",
                password: "invalidpassword"
            });
        expect(res.statusCode).toEqual(400);
    });

    it("should expected Expired or invalid refresh token", async () => {
        const res = await request(app)
            .post("/user/refresh_token")
            .send({
                token:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzYyZWVmMGQ4OTg5ODkyZWY3YTgzMTciLCJpYXQiOjE3MzQ2MzAxOTksImV4cCI6MTczNDYzMDQ5OX0.aIg7CGE6PRTT4UeYXh1pxQyAlUd3YA9jaAfi24hS3nU",
            });
        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toBe("Expired or invalid refresh token");
    });

    

    it("should refresh tokens with a valid refresh token", async () => {
        const res1 = await request(app).post("/users/login").send({
            email: "Omer@gmail.com",
            password: "12345678"
        });

        refreshToken = res1.body.refreshToken;
        
        const res = await request(app)
            .post("/user/refresh_token")
            .send({
                token: refreshToken,
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("accessToken");
        expect(res.body).toHaveProperty("refreshToken");

        refreshToken = res.body.refreshToken;
    });
    it("should exepted Refresh token required", async () => {
        const res = await request(app)
            .post("/users/refresh_token")
            .send({
                token: "",
            });
        expect(res.statusCode).toEqual(403);
    });

    it("should fail to refresh tokens with an invalid refresh token", async () => {
        const res = await request(app).post("/user/refresh_token").send({
            token: "invalid-token",
        });
        expect(res.statusCode).toEqual(403);
    });
    

    it("should fail to Refresh token required", async () => {
        const res = await request(app).post("/user/refresh_token").send({
            token: "",
        });
        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toBe("Refresh token required");
    });
    
    //logout user
    it("should success logout user", async () => {
        const res = await request(app)
            .post("/user/logout")
            .send({
                token: refreshToken,
            });
        expect(res.statusCode).toEqual(200);
    });

    it("should fail to logout a user with an invalid refresh token", async () => {
        const res = await request(app)
            .post("/user/logout")
            .send({
                token: "invalid-token",
            });
        expect(res.statusCode).toEqual(403);
    });

    it("should fail to logout a user with an invalid refresh token", async () => {
        const res = await request(app)
            .post("/user/logout")
            .send({
                token: "",
            });
        expect(res.statusCode).toEqual(400);
    });

    it("should fail to logout a user with an invalid user id", async () => {
        const token = generateRefreshToken('676959d59c69665bcccf39c7');

        const res = await request(app)
            .post("/user/logout")
            .send({ token });

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("User not found");
     });
        it("should fail to logout a user with an invalid refresh token", async () => {
        const token = generateRefreshToken(userId);

        const res = await request(app)
            .post("/user/logout")
            .send({ token });

        expect(res.status).toBe(403);
        expect(res.body.message).toBe("Refresh token is not valid for this user");
    });
    //Auth middleware
    it("should fail to update user access token required", async () => {
        const res = await request(app)
            .put("/user/update")
            .set("Authorization", "")
            .send({
                id: userId,
                firstName: "Omer",
                lastName: "Amsalem",
            });
        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toBe("Access token required");
    });
    it("should fail to update user with invalid access token", async () => {
        const invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzcyNmNjZmQ1ZDYxYWY2YjU0NTA5MTUiLCJpYXQiOjE3MzU1NTIyMjYsImV4cCI6MTczNTU1MjUyNn0.-DmAGumQ_e5QcA1vLX-ihEIDJbWE3rK3SSONs7F6HTk";
    
        const res = await request(app)
            .put("/user/update")
            .set("Authorization", `Bearer ${invalidToken}`)
            .send({
                id: userId,
                firstName: "Omer",
                lastName: "Amsalem",
            });
        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toBe("Invalid or expired access token");
    });
    it("should fail to update user with invalid user id", async () => {
        const token = generateAccessToken('676959d59c69665bcccf39c7');

        const res = await request(app)
            .put("/user/update")
            .set("Authorization", `Bearer ${token}`)
            .send({
                id: userId,
                firstName: "Omer",
                lastName: "Amsalem",
            });
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toBe("User not found");
    });
    


    //Update User
    it("should update user", async () => {
        const res = await request(app)
            .put("/user/update")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                id: userId,
                firstName: "Omer",
                lastName: "Amsalem",
                role: "Instructor",
                profilePicture: "https://pixabay.com/photos",
                description: "Hello, I am Omer Amsalem"
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe("User updated successfully");
    });

    it("should fail to update user with missing fields", async () => {
        const res = await request(app)
            .put("/user/update")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                id: userId,
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe("All fields are required");
    });

    //Delete User
    it("should delete user", async () => {
        const res = await request(app)
            .delete("/user/delete")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                id: userId,
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe("User deleted successfully");
    });
    

});
