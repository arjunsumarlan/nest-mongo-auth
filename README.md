[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">An application for authentication using <a href="https://docs.nestjs.com/" target="_blank">NestJS</a>, Docker, Kubernetes, MongoDB, JWT, and Swagger.</p>
    <p align="center">
    
## Tech Stack

- [Node.js](https://nodejs.org/download/release/v10.23.0/) Node.js version `^10.23`.
- [Yarn](https://yarnpkg.com) for Package Manager.
- [Nest.js](https://github.com/nestjs/nest) as the framework.
- [MongoDB](https://docs.mongodb.com/manual/installation/) for Database Storage.
- [Mongoose](https://mongoosejs.com/) for MongoDB object modeling.
- [Swagger](https://docs.nestjs.com/openapi/introduction) for API Docs.
- [Docker](https://www.docker.com/) for deliver in packages called containers.
- [GKE](https://cloud.google.com/kubernetes-engine/docs) for container-orchestration system.

---

## Flow

![Flow diagram](https://github.com/arjunsumarlan/nest-mongo-auth/blob/master/flow-diagram.jpg?raw=true)

This app contains 6 endpoints:
1. **Create User**

    _description_: for create an user. User will be checked is their email already used before. then, they will get an email to verify token later, to be noted, user will have _emailVerified_ flag to be false before user verify their account. And also don't worry, password will be hashed before insert to DB.
    
    _additional description_: _roles_ has 2 option they are **admin** (can do everything) and **user** (only can read their user info).

    _endpoint_: /auth/create

    _role_: **admin**

    _method_: POST

    _body request_:
    ```json
    {
      "email": "user@gmail.com",
      "roles": [
        "user"
      ],
      "name": "User",
      "password": "User@123"
    }
    ```

2. **Verify Token by Email**

    description: to verify user with token has been sent to their email. Then _emailVerified_ flag will be true, and user can login to this app.
    
    _endpoint_: /auth/verify/{token}

    _method_: GET

    _query params_:
    ```
    token = 9dd930f0-4837-11eb-a06d-6f4e05ebdd0b
    ```
3. **Login User**

    _description_: for logging in an user.

    _endpoint_: /auth/login

    _method_: POST

    _body request_:
    ```json
    {
      "email": "user@gmail.com",
      "password": "User@123"
    }
    ```
4. **Update User**

    _description_: for update an email and name of the user.

    _endpoint_: /auth/update

    _role_: **admin**

    _method_: PUT

    _body request_:
    ```json
    {
      "email": "newuseremail@gmail.com",
      "name": "New User Name",
    }
    ```
5. **Get User Login**

    _description_: to get current user login data.

    _endpoint_: /auth/user

    _method_: GET

6. **Get All User**

    _description_: to get all user data.

    _endpoint_: /auth/users

    _role_: **admin**

    _method_: GET
7. **Delete User**

    _description_: to delete an user by their email.

    _endpoint_: /auth/delete

    _role_: **admin**

    _method_: DELETE

    _body request_:
    ```json
    {
      "email": "user@gmail.com",
    }
    ```

## Setup
First of all, please setup environtment variable file, called .env and production.env, which contain

.env file:
```
NODE_ENV=development
PORT=3000
JWT_SECRET=user2020
EXPIRES_IN=3600
DB_URL=YOUR_MONGODB_DEV_SRV_STRING_URL
```

production.env file:
```
NODE_ENV=production
PORT=3000
JWT_SECRET=user2020
EXPIRES_IN=3600
DB_URL=YOUR_MONGODB_PROD_SRV_STRING_URL
```
Please change **DB_URL** to yours.

Then, you have to install docker, gcloud, and kubectl.

## Installation

```bash
$ yarn install
```

## Seeding DB

To seed your DB data for user admin, just run:
```bash
$ yarn db:seed
```

Then you will have one user which have:
```json
  {
    "email": "admin@gmail.com",
    "name": "Administrator",
    "password": "qwerty",
    "roles": ["admin"]
  }
```

## Running the app on local

To run app on your local, you can run it via _docker-compose_:
```bash
$ docker-compose up
```

## Running the app on GKE

First of all, you have to init gcloud on your local:
```bash
gcloud init
```

Then, build image and deploy it to the [Google Container Registry](https://cloud.google.com/container-registry/)

```bash
docker build -t gcr.io/{{YOUR PROJECT ID}}/nest-mongo-auth:latest .
```
```bash
docker push gcr.io/{{YOUR PROJECT ID}}/nest-mongo-auth:latest
```
change YOUR PROJECT ID to yours.

Now our app is dockerized, then we have to setup our deployment.
First create cluster on GKE by name _nest-mongo-auth_:

```bash
gcloud container clusters create nest-mongo-auth
```

after that, we have to authenticate our shell to use clusters
```bash
gcloud container clusters get-credentials nest-mongo-auth --zone {{YOUR REGION CODE}} --project {{YOUR PROJECT ID}}
```

in **deployment.yaml** file, don't forget to change _YOUR GKE PROJECT ID_, _YOUR TAG VERSION_, and _YOUR MONGODB SRV CONNECTION STRING_ to yours.

Then run deployment & service:
```bash
kubectl run nest-mongo-auth --image gcr.io/{{YOUR PROJECT ID}}/nest-mongo-auth:latest --port 3000
```
```bash
kubectl apply -f deployment.yaml --record
```

To check deployment process:
```bash
kubectl get deployments
```

To check pods (containers):
```bash
kubectl get pods
```

To service and copy **EXTERNAL IP address** (LoadBalancer):
```bash
kubectl get services
```

Now, you can open your browser this URL to see Swagger docs for this app:
```
http://<EXTERNAL-IP>/docs/#/
```

