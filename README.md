# Shopping site

A modern e-commerce demo built with Angular 20+ featuring standalone components, signals-based state management, and clean architecture with repository pattern. Includes product browsing, cart functionality, and reactive UI updates.

**Tech Stack:** Angular 20, Express.js, TypeScript, Signals, Standalone Components
## TODO's
- [x] Express backend with endpoints for fetching products and placing orders
- [x] Angular frontend for viewing products and managing cart with signals based state management
- [ ] Handle order placing
- [ ] Setup login for admin/users
- [ ] Admin tools for managing stock and adding products

## Installation

### Install Angular App Dependencies
```bash
npm install
```

### Install Express Server Dependencies
```bash
cd server
npm install
cd ..
```

## Development server

### Starting the Angular App
To start the Angular development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

### Starting the Express Server
To start the Express.js backend server, run:

```bash
cd server
npm start
```

The Express server will run on `http://localhost:3000/` and provides the product data API.
