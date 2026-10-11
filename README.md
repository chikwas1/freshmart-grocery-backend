# Grocery Store Backend API

A RESTful backend service built using Express 5, Node.js, and MongoDB.

## API Specification

### Authentication
* `POST /auth/register` - Register a new user (`user` or `admin`).
* `POST /auth/login` - Authenticate and acquire Bearer JWT.
* `POST /auth/logout` - Blacklist active token.

### Categories
* `GET /categories` - List categories.
* `POST /categories` - Create category *(Admin)*.
* `PUT /categories/:id` - Update category *(Admin)*.
* `DELETE /categories/:id` - Delete category *(Admin)*.

### Products
* `GET /products?page=1&limit=10` - List products with pagination.
* `GET /products/:id` - Fetch single product details.
* `POST /products` - Add product *(Admin)*.
* `PUT /products/:id` - Update product *(Admin)*.
* `DELETE /products/:id` - Delete product *(Admin)*.

### Orders
* `POST /orders` - Place order with automatic inventory validation.
* `GET /orders/my-orders` - List current user orders.
* `GET /orders` - Fetch all orders across system *(Admin)*.
* `PATCH /orders/:id/status` - Modify status *(Admin)*.

## Quickstart

1. Clone repository and install dependencies:
   ```bash
   npm install
