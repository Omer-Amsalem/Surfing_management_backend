import { Request, Response, NextFunction } from "express";


const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Error: ", err.message);

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode; 

    res.status(statusCode).json({
        status: statusCode, 
        message: err.message, 
    });
};

export default errorHandler;
