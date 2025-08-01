import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../context/StoreContext";
import { API_BASE_URL } from "../config/api";

const RatingsDebug = () => {
  const { foodList, foodRatings, fetchFoodRatings } = useContext(StoreContext);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    // Test direct API calls
    const testAPI = async () => {
      const testResults = {};
      for (const food of foodList) {
        try {
          const response = await fetch(
            `${API_BASE_URL}/api/order/food-ratings/${food._id}`
          );
          const data = await response.json();
          testResults[food._id] = data;
        } catch (error) {
          testResults[food._id] = { error: error.message };
        }
      }
      setDebugInfo(testResults);
    };

    if (foodList.length > 0) {
      testAPI();
    }
  }, [foodList]);

  return (
    <div
      style={{ padding: "20px", backgroundColor: "#f0f0f0", margin: "20px" }}
    >
      <h3>Ratings Debug Info</h3>
      <p>
        <strong>Food List Length:</strong> {foodList.length}
      </p>
      <p>
        <strong>Food Ratings State:</strong> {JSON.stringify(foodRatings)}
      </p>

      <h4>Direct API Test Results:</h4>
      {Object.keys(debugInfo).map((foodId) => (
        <div key={foodId}>
          <strong>Food ID {foodId}:</strong> {JSON.stringify(debugInfo[foodId])}
        </div>
      ))}

      <h4>Food Items with Expected Ratings:</h4>
      {foodList
        .filter((food) => [6, 7, 11].includes(food._id))
        .map((food) => (
          <div key={food._id}>
            <strong>
              {food.name} (ID: {food._id}):
            </strong>
            Context Rating: {JSON.stringify(foodRatings[food._id])}
          </div>
        ))}
    </div>
  );
};

export default RatingsDebug;
