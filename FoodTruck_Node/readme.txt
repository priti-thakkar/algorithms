Program that will send list of food trucks, given a source of food truck data from the San Francisco government’s API
API: https://data.sfgov.org/resource/jjew-r69b.json

System Requirement:
Nodejs - Version : V8+

How to install : link to nodejs install steps
Windows: https://nodejs.org/en/download/package-manager/#windows
MacOS: https://nodejs.org/en/download/package-manager/#macos

How to Run: 
copy the files in required path: example: foodtruck_app
> navigate to the folder
> node App.js
> Server starts with http://localhost:8080/

File details: 
App.js > This file is used for Starting the server & and route/handle requests  ( /,/foodtrucks)
DataUtil.js > This file is used for Fetching the data from Food truck REST api 
ConnectionUtil.js > This file is used for generating the SoQL requests as per the parameter
TimeUtil.js > This file is used to generate HH:MM time from current time

Index.html > This file is used to view the food truck data.