import { SuccessResult } from "../utils/success_response";
import { BaseErrorException } from "../utils/error_handler";
import { HomeModel, IHome } from "../models/home_model";
import { Types } from "mongoose";

export async function createHome(homeData: Partial<IHome>) {
  try {
    const homeDoc = await HomeModel.create(homeData);
    if (homeDoc) {
      return new SuccessResult({
        code: 201,
        message: "Home content created successfully",
        body: { home: homeDoc },
      });
    } else {
      throw new BaseErrorException({
        code: 500,
        message: "Failed to create home content",
        error: "MONGO_INSERTION_ERROR",
        logInfo: { homeData },
      });
    }
  } catch (error) {
    if (error instanceof BaseErrorException) {
      throw error;
    }
    throw new BaseErrorException({
      code: 500,
      message: "Failed to create home content",
      error: "DATABASE_ERROR",
      logInfo: { error, homeData },
    });
  }
}

export async function getHomeById(id: string) {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new BaseErrorException({
        code: 400,
        message: "Invalid home ID",
        error: "INVALID_ID",
        logInfo: { id },
      });
    }

    const homeDoc = await HomeModel.findById(id);
    if (homeDoc) {
      return new SuccessResult({
        code: 200,
        message: "Home content retrieved successfully",
        body: { home: homeDoc },
      });
    } else {
      throw new BaseErrorException({
        code: 404,
        message: "Home content not found",
        error: "HOME_NOT_FOUND",
        logInfo: { id },
      });
    }
  } catch (error) {
    if (error instanceof BaseErrorException) {
      throw error;
    }
    throw new BaseErrorException({
      code: 500,
      message: "Failed to retrieve home content",
      error: "DATABASE_ERROR",
      logInfo: { error, id },
    });
  }
}

export async function getAllHomes(page: number = 1, limit: number = 10) {
  try {
    const skip = (page - 1) * limit;
    const homes = await HomeModel.find({ isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await HomeModel.countDocuments({ isActive: true });
    
    return new SuccessResult({
      code: 200,
      message: "Home content retrieved successfully",
      body: { 
        homes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }
      },
    });
  } catch (error) {
    throw new BaseErrorException({
      code: 500,
      message: "Failed to retrieve home content",
      error: "DATABASE_ERROR",
      logInfo: { error, page, limit },
    });
  }
}

export async function updateHome(id: string, updateData: Partial<IHome>) {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new BaseErrorException({
        code: 400,
        message: "Invalid home ID",
        error: "INVALID_ID",
        logInfo: { id },
      });
    }

    const homeDoc = await HomeModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (homeDoc) {
      return new SuccessResult({
        code: 200,
        message: "Home content updated successfully",
        body: { home: homeDoc },
      });
    } else {
      throw new BaseErrorException({
        code: 404,
        message: "Home content not found",
        error: "HOME_NOT_FOUND",
        logInfo: { id },
      });
    }
  } catch (error) {
    if (error instanceof BaseErrorException) {
      throw error;
    }
    throw new BaseErrorException({
      code: 500,
      message: "Failed to update home content",
      error: "DATABASE_ERROR",
      logInfo: { error, id, updateData },
    });
  }
}

export async function deleteHome(id: string) {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new BaseErrorException({
        code: 400,
        message: "Invalid home ID",
        error: "INVALID_ID",
        logInfo: { id },
      });
    }

    const homeDoc = await HomeModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (homeDoc) {
      return new SuccessResult({
        code: 200,
        message: "Home content deleted successfully",
        body: { home: homeDoc },
      });
    } else {
      throw new BaseErrorException({
        code: 404,
        message: "Home content not found",
        error: "HOME_NOT_FOUND",
        logInfo: { id },
      });
    }
  } catch (error) {
    if (error instanceof BaseErrorException) {
      throw error;
    }
    throw new BaseErrorException({
      code: 500,
      message: "Failed to delete home content",
      error: "DATABASE_ERROR",
      logInfo: { error, id },
    });
  }
}
