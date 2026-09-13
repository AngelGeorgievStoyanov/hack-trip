# HACK-TRIP - https://github.com/AngelGeorgievStoyanov/hack-trip
# https://www.hack-trip.com
## Author: Angel Stoyanov
### Technologies used:
* React-TypeScript
* MySQL 
* Express.js
* Node.js
* MUI
* YUP
* Google Maps
* Google Cloud
* HTML & CSS


### Functionality
* Guest users can see Home page with TOP 5 TRIPS (HOME PAGE) most liked trips and page with ALL TRIPS, they wont't be able to see the details page of the TRIPS and comments or points.  
* Logged users have extended functionality with option to create trips and comments, add/edit/delete trips and comments, they will only be able to like trips if they are not the owner,on MY-TRIPS page they will be able to see all their own trips, on MY-FAVORITES page they will be able to see if they added favourite trips.
* Trips owners can edit and delete their trips and add points(Markers) on Google Maps.
* Comments' owners can edit and delete their comments.

# Connection with REST API MySQL
* Default HACK-TRIP is the connection with REST API MySQL.   

# REST API MySQL - https://github.com/AngelGeorgievStoyanov/REST-API-MYSQL
* To run server npm start
* To run client app cd client and npm start


# Getting Started with Vite

This project uses Vite for development and production builds.

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Starts the Vite development server.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.

### Tests

No test script is currently configured.

### `npm run build`

Builds the app for production in the `dist` folder with Vite.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

Use `npm run preview` to inspect the production build locally.

### Production preview

The project uses Vite configuration directly.

Vite configuration is maintained in `vite.config.ts`.

The production output is generated in `dist`.

### `npm run preview`

Serves the production build locally for preview.
