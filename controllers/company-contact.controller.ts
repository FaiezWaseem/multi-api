import type { NextFunction, Request, Response } from "express";

import { createSuccessResponse } from "../lib/api-response";
import { findCompanyContactEmails } from "../services/company-contact.service";
import {
  getCompanyContactSchema,
  postCompanyContactSchema,
} from "../validations/company-contact.validation";

export async function getCompanyContactController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { title, domain } = getCompanyContactSchema.parse(req.query);
    const payload = await findCompanyContactEmails(title, domain);

    res.status(200).json(createSuccessResponse("Company contact discovery completed successfully", payload));
  } catch (error) {
    next(error);
  }
}

export async function postCompanyContactController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { title, domain } = postCompanyContactSchema.parse(req.body);
    const payload = await findCompanyContactEmails(title, domain);

    res.status(200).json(createSuccessResponse("Company contact discovery completed successfully", payload));
  } catch (error) {
    next(error);
  }
}
