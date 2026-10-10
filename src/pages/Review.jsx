import { useState } from "react";
import {FaStar} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useParams, useLocation } from "react-router-dom";
import { useLogin } from "../context/LoginContext.jsx";

function SubmitReview (){

    const colors = {
    orange: "#FFBA5A", 
    grey: "#a9a9a9"
    };

    const stars = Array(5).fill(0);    
    const { id, movieId } = useParams();
    const currentId = id || movieId;
    const navigate = useNavigate();
    const location = useLocation();
    
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [hoverValue, setHoverValue] = useState(0);

    const displayTitle = location.state?.movieTitle || location.state?.tvshowName || "Title";
    const mediaType = location.state?.mediaType || "movie";
    const { user } = useLogin();
    const userId = user?.id ;


//Event handlers
    //When a star is clicked it value is stored in rating
    const handleClick = value => {
        setRating(value)
    };

    //Tarkkailee onko hiiri tähtien päällä
    const handleMouseOver = value => {
        setHoverValue(value)
    };

    //nollaa tähdet jos hiiri ei ole niiden päällä
    const handleMouseLeave = value => {
        setHoverValue(0)
    };


    const handleSubmit = async (e) => {
        
        e.preventDefault();

        try {

            const response = await fetch(`http://localhost:3000/api/reviews/user/${userId}/movie/${currentId}/title/${displayTitle}/${mediaType}`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    review_text: review,
                    rating: rating,
                    media_type: mediaType
                })
            })
      
        //Nollaa arvot
        setRating(0);
        setReview('');

        //Siirtyy takaisin elokuvan sivulle
        if(mediaType === 'tv') {
            navigate(`/tvshows/${currentId}`);
        } else {
        navigate(`/movies/${currentId}`);}
         

} catch (err) {
    console.error("Server error", err);
}
}

return (
    <div className="review">
        <div className="review-box">

            <h1>Add user review </h1>

        {user ? (
            <form className="review-form" onSubmit={handleSubmit}>
                <label htmlFor="rating"> Add rating </label>
                <div>
                  {stars.map((_, index) => {
                    return (
                    <FaStar
                        key={index}
                        size={24}
                        color={(hoverValue || rating) > index ? colors.orange : colors.grey}
                        onClick={() => handleClick(index + 1)}
                        onMouseOver={() => handleMouseOver (index + 1)}
                        onMouseLeave={ handleMouseLeave }
                    />
                    );
                  })}

                </div>

                <label htmlFor="review"> Write a review</label>
                <textarea
                id="review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                />

                <button type="submit" className="review-submit-button"> Submit review </button>

            </form>
            ) :  (
                <div className="not-logged-in"> 
                    <p> Login to leave a review </p>
                    <button onClick={() => navigate("/login")}>
                    Login here
                    </button>
                </div>
            )}

        </div>

    </div>

)
}

export default SubmitReview