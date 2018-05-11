# P-Commerce
Prototype Peer2Peer E-commerce Website using Express.js/Node.js/Server-side-rendered React/MongoDB as backend, and JQuery frontend.
Features include  

### Prerequisites

- NPM 5.6.0
- MongoDB 3.4.10
- Mocha 4.0.1

### Getting Started

To install, simply run

```
npm install
```

Initialize MongoDB

```
mongod
```

Run the site.

```
npm start
```

## Running the tests

Run Mocha to run unit-tests.

```
mocha
```

### File Structure
./app.js - application initializer, server, server-configurations such as routes, and middleware defined here.
./db.js - interface to the mongo database.
./config.js - various configurations, contains 'drop_create_mock_db' flag which setting to true will drop and create
a new database populated with mock data.
./models - business entity definition which provides persistence interface.
./controllers - actions on each route. 
./middleware - various modules used as callback in express when a route is access.
./authentication - modules for configuring authentication and permission.
./public - files served to client.
./views - React classes to be rendered in server-side.
./test - unit tests



## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.


## Authors

* **Natcha Simsiri** - *Initial work*

## License

This project is used as a showcase, please kindly ask for permission before any kind of usage.
