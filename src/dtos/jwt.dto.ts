//jwt.dto


export interface TokenPayload  {
    id: number;
    role: "CUSTOMER" | "SELLER" | "ADMIN";
}