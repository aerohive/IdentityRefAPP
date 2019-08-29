# NO LONGER MAINTAINED
As of August 30, 2019 this project is no longer maintained. It should still (probably) work, but I am no longer providing support, fixing issues, or adding new features.

# identity

This is a Free web app built to work with Aerohive APIs. This app is designed to provide a user friendly interface to manage/create/remove/renew PPSK or login/pwd account stored on HiveManager NG (Cloud or OnPremise)

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 
This application is publicly available [here](https://identity.ah-lab.fr) (You will need a HiveManager NG account).
![identity](https://github.com/tmunzer/identity/blob/master/identity.png?raw=true)

## Install
This Reference Application can be used as a standalone Application, or it can be deployed as a Docker Image.

### Standalone Application
This Reference APP is built over NodeJS. 

#### Deploy the Application
* Install NodeJS LTS: https://nodejs.org/en/download/.
* Clone this repo.
* Configure the API parameters, in the `src/config.js` file. You will find an example in `src/config_example.js`. To be able to use this application, you will need an account on the [Aerohive Developper Portal](https://developer.aerohive.com/).
* Configure the SMTP server parameters in the `src/mailer_config.js` file. You will find an example in `src/mailer_config_example.js`.
* Install npm packages (`npm install` from the project folder).
* Install bower packages (`bower install` from the project folder).
* Go to `src/bin` folder into the project.
* Start the APP with `www`. You can also use `src/bin/monitor.js` to monitor the NodeJS server and restart it if something went wrong.

#### Manage HTTPS at the application level
If you want to use OAuth authentication, the application will need to use HTTPS. To do so, you can use a reverse Proxy (NGINX, Apache, ...) and manage the certificates at the reverse proxy level, or you can start the application with `www_with_https`. In this case:
* Create a `cert` folder into the `src` project folder.
* Place you certificate and certificate key in this new folder, with the names `server.pem` and `server.key`.
* Start the APP with `www_with_https`. 

### Docker Image
You can easily deploy this application with [Docker](https://www.docker.com/). The image is publicly available on Docker Hub at https://hub.docker.com/r/tmunzer/identity/.
In this case, you can choose to manually deploy the image and create the container, or you can use the automation script (for Linux).

#### Automation Script
The Automation script will allow you to easily 
* Configure your application (ACS parameters)
* Manage HTTPS certificates with self-signed certificates or with let's encrypt image (the script will automatically download and deploy the let's encrypt container if needed)
* Download and Deploy dependencies, like NGINX container
* Download, Deploy, Update the application container
To use this script, just download it [here](https://raw.githubusercontent.com/tmunzer/identity/master/identity.sh), and run it in a terminal.

#### Manual deployment
If you are manually deploying this container, you will need to a reverse proxy to manage HTTPS.

```docker create -v <path_to_config.js>/config.js:/app/config.js:ro -v <path_to_mailer_config.js>/mailer_config.js:/app/mailer_config.js:ro --link <mongoDB_container_name>:mongo --name="<container_name>" -p 51361:80 tmunzer/identity```
