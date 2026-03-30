import type { NextFunction, Request, Response } from "express";

import { createErrorResponse, createSuccessResponse } from "../lib/api-response";
import {
  apiTokenIdParamSchema,
  createApiTokenSchema,
  loginSchema,
  registerSchema,
  updateApiTokenSchema,
} from "../validations/auth.validation";
import {
  createApiTokenForUser,
  listApiTokensForUser,
  loginUser,
  renameApiTokenForUser,
  revokeApiTokenForUser,
  registerUser,
} from "../services/auth.service";

export async function registerController(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = registerSchema.parse(req.body);
    const user = await registerUser(email, password);

    res.status(201).json(createSuccessResponse("Account registered successfully", user, 201));
  } catch (error) {
    next(error);
  }
}

export async function loginController(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const session = await loginUser(email, password, {
      ipAddress: req.ip,
      userAgent: req.header("user-agent") ?? null,
    });

    res.status(200).json(createSuccessResponse("Login successful", session));
  } catch (error) {
    next(error);
  }
}

export function createApiTokenController(req: Request, res: Response, next: NextFunction) {
  try {
    const { name } = createApiTokenSchema.parse(req.body);
    const authUser = req.authUser;

    if (!authUser) {
      res.status(401).json(createErrorResponse("Unauthorized", 401));
      return;
    }

    const apiToken = createApiTokenForUser(authUser.id, name);

    res.status(201).json(createSuccessResponse("API token created successfully", apiToken, 201));
  } catch (error) {
    next(error);
  }
}

export function listApiTokensController(req: Request, res: Response, next: NextFunction) {
  try {
    const authUser = req.authUser;

    if (!authUser) {
      res.status(401).json(createErrorResponse("Unauthorized", 401));
      return;
    }

    const tokens = listApiTokensForUser(authUser.id);

    res.status(200).json(createSuccessResponse("API tokens fetched successfully", tokens));
  } catch (error) {
    next(error);
  }
}

export function updateApiTokenController(req: Request, res: Response, next: NextFunction) {
  try {
    const authUser = req.authUser;

    if (!authUser) {
      res.status(401).json(createErrorResponse("Unauthorized", 401));
      return;
    }

    const { id } = apiTokenIdParamSchema.parse(req.params);
    const { name } = updateApiTokenSchema.parse(req.body);
    const token = renameApiTokenForUser(authUser.id, id, name);

    res.status(200).json(createSuccessResponse("API token updated successfully", token));
  } catch (error) {
    next(error);
  }
}

export function revokeApiTokenController(req: Request, res: Response, next: NextFunction) {
  try {
    const authUser = req.authUser;

    if (!authUser) {
      res.status(401).json(createErrorResponse("Unauthorized", 401));
      return;
    }

    const { id } = apiTokenIdParamSchema.parse(req.params);
    const result = revokeApiTokenForUser(authUser.id, id);

    res.status(200).json(createSuccessResponse("API token revoked successfully", result));
  } catch (error) {
    next(error);
  }
}
