//jwt.ts


import jwt from "jsonwebtoken";
import { TokenPayload } from "../dtos/jwt.dto";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}
export const generateAccessToken = (payload: TokenPayload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
}

export const verifyAccessToken = (token: string) : TokenPayload => {
    return jwt.verify(
        token,
        JWT_SECRET) as TokenPayload
};