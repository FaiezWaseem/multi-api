import "express";

declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: string;
        email: string;
        isPaid: boolean;
        isAdmin: boolean;
      };
      apiConsumer?: {
        id: string;
        email: string;
        tier: "free" | "auth" | "paid";
        tokenId: string;
        isAdmin: boolean;
      };
      apiTokenInvalid?: boolean;
    }
  }
}

export {};
