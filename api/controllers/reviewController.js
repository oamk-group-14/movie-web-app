import { pool } from "../models/db.js";
import { createReview, getAllReviews, getReviewsByMedia } from "../models/review.js";

// Create review
export const review = async(req, res) => {
    try{
        
        const { user_id, movie_id, title, media_type} = req.params;
        
        const { review_text, rating} = req.body;

        if(!review_text || !rating ) {
            return res.status(400).json({ message: "Leave a review and rating"});
        }

        const newReview = await createReview(user_id, movie_id, title, media_type, review_text, rating);
        return res.status(200).json(
            {
                message: "Review was successful",
                data: newReview
            });

    } catch (err) {
        return res.status(500).json({ error: "Server error"});
    }

}

//Fetch one reviews by media
export const getMediaReview = async(req, res) => {
    try{
        const { id, media_type} = req.params;

        const singleReview = await getReviewsByMedia(id, media_type);

        if(!singleReview || singleReview.length === 0){
            return res.status(200).json({ message: "No reviews found",
                data: []
            });
        }
        return res.status(200).json({ 
            message: "Review fetched successfully",
            data: singleReview
        });

    } catch (err){
        return res.status(500).json({ error: "Server error"});
    }
}

//Fetch all reviews
export const getReviewList = async(req, res) => {
    try{
        const reviewList = await getAllReviews();

        return res.status(200).json({ 
            message: "All reviews fetched successfully",
            data: reviewList
        });
    } catch (err){
        return res.status(500).json({ error: "Server error" });
    }
}
