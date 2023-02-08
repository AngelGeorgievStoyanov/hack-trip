# HACK-TRIP - https://github.com/AngelGeorgievStoyanov/hack-trip

## React-TypeSript project for AKKODIS react-typescript-academy-2022 by Trayan Iliev-iproduct

### Technologies used:
* React-TypeSript
* MySQL 
* Express.js
* Node.js
* MUI
* YUP
* Google Maps
* HTML & CSS


### Functionality
* Guest users can see Home page with TOP 5 TRIPS (HOME PAGE) most liked trips and page with ALL TRIPS, they wont't be able to see any comments.  
* Logged users have extended functionality with option to create trips and comments, add/edit/delete trips and comments, they will only be able to like trips if they are not the owner,on MY-TRIPS page they will be able to see all their own trips.
* Trips owners can edit and delete their trips.
* Comments' owners can edit and delete their comments.

# Connection with REST API MySQL or REST API MONGODB
* Default HACK-TRIP is the connection with REST API MySQL, to change the connection with to REST API MONGODB enter the folder 
*  src/utils  in the file baseUrl.ts and change the CONNECTIONURL.   

# REST API MySQL - https://github.com/AngelGeorgievStoyanov/REST-API-MYSQL
* To run server npm start
* To run client app cd client and npm start
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.2.6.


# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
