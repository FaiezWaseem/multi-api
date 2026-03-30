import "express";

declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: string;
        email: string;
        isPaid: boolean;
      };
      apiConsumer?: {
        id: string;
        email: string;
        tier: "free" | "auth" | "paid";
        tokenId: string;
      };
      apiTokenInvalid?: boolean;
    }
  }
}

export {};
