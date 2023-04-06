
# chat

A chatting app. Uses Socket.io for real time communication and stores user details in mySQL database

## Tech Stack

**Frontend:** React JS

**Server:** Node JS, Express JS

**Database:** MySQL

### **Run database Docker container**

```bash
docker run --name mysqldb -e MYSQL_ROOT_PASSWORD=mysql -p 3306:3306 -d mysql:latest
```

Note that my application uses username `root` and password `mysql`.

### **Run the application**

* Go to the project directory

```bash
  cd chat
```

* Install dependencies (Must use YARN)

```bash
  yarn install
```

```bash
  cd frontend/
  yarn install
```

* Start the server

```bash
  yarn start
```

* Start the Client

```bash
  //open now terminal
  cd frontend
  yarn start
```
