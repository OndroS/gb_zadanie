# GB Picking Optimization Service

### Installation

`npm install`

### Running the service 

`npm start`

### Endpoint overview 

`localhost:3000/api/products/optimized-positions`

Body
```json
{
  "products": ["product-1", "product-2", "product-3", "product-4"],
  "workerStartingCoordinates": {
      "x": 0,
      "y": 0,
      "z": 0
  }
}
```
Response
```json
{
    "pickingOrder": [
        {
            "productId": "product-1",
            "positionId": "position-31"
        },
        {
            "productId": "product-4",
            "positionId": "position-120"
        }
        ...
    ]
}
```

## Problem introduction

The Picking Optimization Service is designed to facilitate the preparation of orders in a warehouse setting. This code aims to minimize the time required to prepare orders by optimizing the picking sequence of products.

## Algorithm Overview

### 1. Flattening Product Positions

The algorithm begins by flattening the `productPositions` array, creating a single array of products. This allows us to handle all product positions collectively.

### 2. Finding the Closest Product

The core of the algorithm involves repeatedly finding the closest product to the current position (starting with the worker's coordinates). The `calculateDistance` function computes the Euclidean distance in 3D space between two coordinates, helping identify the closest product. This step continues until no products are left to pick.

### 3. Updating the Picking Order

Once the closest product is found, it's added to the `pickingOrder` list. The distance to the closest product is added to the total distance, and the current coordinates are updated to the closest product's position.

### 4. Removing the Picked Product

The closest product is removed from the products array, ensuring it's not selected again.

## Final Output

The final result contains the optimized picking order and the total distance required to pick up all ordered products.

## Reasoning

The reason behind using this approach is its simplicity and direct applicability to the problem. By iteratively selecting the nearest product, we ensure a minimal path is followed, aligning with the objective of reducing preparation time. Since the algorithm doesn't take into account any real-world obstacles, it may be extended in the future to include such constraints for a more realistic scenario.

## Future Work

Further optimizations and enhancements could include implementing a more sophisticated pathfinding algorithm that considers obstacles or employing heuristic methods like A* search to find an even more optimal solution.