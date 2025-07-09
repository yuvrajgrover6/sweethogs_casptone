import { Request, Response } from "express";
import { basicErrorResults } from "../utils/error_handler";
import { createHome, getHomeById, getAllHomes, updateHome, deleteHome } from "../services/home_service";
import { HomeJSONSchema } from "../models/home_model";
import { validateData } from "../utils/error_handler";
import { checkAuthToken } from "../utils/auth_token";

export async function createNewHomeController(req: Request, res: Response) {
  try {
    const token = req.headers.authorization;
    const homeData = req.body;
    validateData(HomeJSONSchema, homeData);

    const decoded = checkAuthToken(token);
    homeData.createdBy = decoded.userId;

    const result = await createHome(homeData);
    res.status(result.code).json(result);
  } catch (e) {
    const err = basicErrorResults(e, "Failed to create home content");
    res.status(err.code).json(err);
  }
}

export async function getHomeController(req: Request, res: Response) {
  try {
    const homeId = req.params.id;
    const result = await getHomeById(homeId);
    res.status(result.code).json(result);
  } catch (e) {
    const err = basicErrorResults(e, "Failed to retrieve home content");
    res.status(err.code).json(err);
  }
}

export async function listHomesController(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await getAllHomes(page, limit);
    res.status(result.code).json(result);
  } catch (e) {
    const err = basicErrorResults(e, "Failed to list home content");
    res.status(err.code).json(err);
  }
}

export async function updateHomeController(req: Request, res: Response) {
  try {
    const homeId = req.params.id;
    const updateData = req.body;
    validateData(HomeJSONSchema, updateData);
    
    const result = await updateHome(homeId, updateData);
    res.status(result.code).json(result);
  } catch (e) {
    const err = basicErrorResults(e, "Failed to update home content");
    res.status(err.code).json(err);
  }
}

export async function deleteHomeController(req: Request, res: Response) {
  try {
    const homeId = req.params.id;
    const result = await deleteHome(homeId);
    res.status(result.code).json(result);
  } catch (e) {
    const err = basicErrorResults(e, "Failed to delete home content");
    res.status(err.code).json(err);
  }
}
