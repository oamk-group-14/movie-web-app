import express from 'express';
import { getReviewList, review, getMediaReview} from '../controllers/reviewController.js';

const router = express.Router();

//Get all reviews
router.get('/', getReviewList);


router.get('/media/:id/type/:media_type', getMediaReview);

//Post reviews
router.post('/user/:user_id/movie/:movie_id/title/:title/:media_type', review);


export default router;