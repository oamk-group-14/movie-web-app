import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { useParams } from "react-router-dom";

function ReviewsList ({mediaType = "movie"}) {

    const { id: movieId } = useParams();
    const starColors = { orange: "#FFBA5A", grey: "#a9a9a9" };
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setIsLoading(true);

                //Fetch reviews from the database
            const response = await fetch(`http://localhost:3000/api/reviews/media/${movieId}/type/${mediaType}`);
            const reviewData = await response.json();
            
            if(response.ok) {
                setReviews(reviewData.data || []);
        }
    } catch (err){
        console.error("Cannot load reviews", err);
} finally {
    setIsLoading(false);}
};
if (movieId) {
    fetchReviews();
}
}, [movieId, mediaType]);

if (isLoading){
    return <p> Loading reviews...</p>;
}

return (
    <div className="reviews-container">
        <h2> Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
            <p className="no-reviews"> No reviews yet. </p>
        ) : (
            reviews.map((rev) => (
                <div key={rev.review_id} className="review-card">
                <div className="review-header">
                    <span className="review-user"> User {rev.user_id}</span>
                    <div className="review-rating">
                        {Array(5).fill(0).map((_, index) => (
                        <FaStar
                            key={index}
                            size={16}
                            color={rev.rating > index ? starColors.orange : starColors.grey}
                                    />
                                ))}
                    </div>
                </div>
                <div> 
                    <small className="review-date">
                        {new Date(rev.created_at).toLocaleDateString("fi-FI")}
                    </small>
                    <p className="review-text">
                        {rev.review_text}
                    </p>
                </div>
            </div>
        ))
        )}
    </div> 

)

}

export default ReviewsList;