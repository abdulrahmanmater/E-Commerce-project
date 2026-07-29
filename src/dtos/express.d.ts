// express.d.ts

//from AI to add user property to request  => req.user
import { TokenPayload } from "./jwt.dto";

declare global {
  namespace Express {
    interface Request {
      user: TokenPayload;
      validated?: {
        body: unknown;
        params: unknown;
        query: unknown;
      };
    }
  }
}

export {};
