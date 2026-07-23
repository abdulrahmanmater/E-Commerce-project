// express.d.ts


//from AI to add user property to request  => req.user
import { TokenPayload } from "../utils/jwt";

declare global {
    namespace Express {
        interface Request {
            user: TokenPayload;
        }
    }
}

export {};