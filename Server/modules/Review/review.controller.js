import { ReviewService } from "./review.service.js";
import { validateObjectId } from "../../utils/validateObjectId.js";

export const getTopReviewsController = async (req, res, next) => {
  try {
    const reviews = await ReviewService.getTopReviews();
    res.status(200).json({
      message: "Mejores reseñas obtenidas correctamente",
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const createReviewController = async (req, res, next) => {
  try {
    const { product, rating, comment } = req.body;
    validateObjectId(product, "product id");

    const review = await ReviewService.createReview(
      req.user._id,
      product,
      rating,
      comment,
    );

    res.status(201).json({
      message: "Reseña creada correctamente",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllReviewsController = async (req, res, next) => {
  try {
    if (req.query.product) validateObjectId(req.query.product, "product id");
    if (req.query.user) validateObjectId(req.query.user, "user id");

    const result = await ReviewService.getAllReviews(req.query);

    res.status(200).json({
      message: "Reseñas obtenidas correctamente",
      data: result.reviews,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getOneReviewController = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, "review id");

    const review = await ReviewService.getOneReview(id);

    res.status(200).json({
      message: "Reseña obtenida correctamente",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const updateReviewController = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, "review id");

    const review = await ReviewService.updateReview(
      id,
      req.user._id,
      req.user.role,
      req.body,
    );

    res.status(200).json({
      message: "Reseña actualizada correctamente",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReviewController = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, "review id");

    await ReviewService.deleteReview(id, req.user._id, req.user.role);

    res.status(200).json({
      message: "Reseña eliminada correctamente",
    });
  } catch (error) {
    next(error);
  }
};
