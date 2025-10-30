# Shopping Site Backend

This is the backend for the Shopping Site application, built using Node.js and Express. The backend serves as an API for the Angular frontend, providing endpoints to retrieve products and place orders.

## Project Structure

```
shopping-site-backend
├── src
│   ├── server.ts               # Entry point of the backend application
│   ├── routes                  # Contains route definitions
│   │   ├── products.routes.ts  # Routes for product-related requests
│   │   └── orders.routes.ts    # Routes for order-related requests
│   ├── controllers             # Contains the logic for handling requests
│   │   ├── products.controller.ts # Controller for product-related logic
│   │   └── orders.controller.ts   # Controller for order-related logic
│   ├── models                  # Contains data models
│   │   ├── product.model.ts    # Model for product data structure
│   │   └── order.model.ts      # Model for order data structure
│   └── data                   # Contains data files
│       └── products.json       # Sample product data in JSON format
├── package.json                # NPM package configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd shopping-site-backend
   ```

2. Install the dependencies:
   ```
   npm install
   ```

## Running the Application

To start the server, run the following command:
```
npm start
```

The server will be running on `http://localhost:3000`.

## API Endpoints

### Products

- **GET /api/products**: Retrieve a list of all products.

### Orders

- **POST /api/orders**: Place a new order. The request body should include the product ID, quantity, and customer details.

## License

This project is licensed under the MIT License.