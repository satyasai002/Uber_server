require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const app = express();

const apiRoutes = require("./routes/api");
const userRoutes = require("./routes/user");

app.use(cors());
app.use(morgan("tiny"));
app.use(express.json());

mongoose.set("strictQuery", false);
mongoose.connect(process.env.DATABASE_URI).then(console.log("db connected"));
mongoose.Promise = global.Promise;

app.use("/api", apiRoutes);
app.use("/user", userRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: '*',
  },
});

let drivers = {};
let users = {};

io.on("connection", (socket) => {
  console.log("New client connected");
// {
// "userID":"1234",
// "userLocation":{
// "lat":"1",
// "lng":"1"
// }
// }
  socket.on("userLocation", ({ userID, userLocation }) => {
    users[socket.id] = { userID, userLocation };
    console.log("user with userID - ", userID, " Connected");
    const nearDrivers = calculateNearDrivers(userLocation);
    socket.emit("nearDrivers", nearDrivers);
  });

  
socket.on("driverLocation", ({ driverID, driverLocation }) => {
  const rotation = calculateHeading(driverLocation, drivers[socket.id]?.driverLocation);
  drivers[socket.id] = { driverID, driverLocation, rotation }; // Include rotation
  for (const userId in users) {
    const nearDrivers = calculateNearDrivers(users[userId].userLocation);
    console.log(nearDrivers)
    io.to(userId).emit("nearDrivers", nearDrivers)
  }
});

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    if (socket.id in users) {
      delete users[socket.id];
    } else if (socket.id in drivers) {
      delete drivers[socket.id];
      for (const userId in users) {
        const nearDrivers = calculateNearDrivers(users[userId].userLocation);
        io.to(userId).emit("nearDrivers", nearDrivers);
      }
    }
  });
});
const calculateHeading = (cord1, cord2) => {
  
  if (cord2) {
    const { lat: lat1, lng: lng1 } = cord1;
    const { lat: lat2, lng: lng2 } = cord2;
    const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
    const θ = Math.atan2(y, x);
    const brng = ((θ * 180) / Math.PI + 360) % 360;
    return Math.trunc(brng)+180;
  }
  return 0;
};
function calculateDistance(location1, location2) {
  var R = 6371; // km
  var dLat = toRad(location2.lat - location1.lat);
  var dLon = toRad(location2.lng - location1.lng);
  var lat1 = toRad(location1.lat);
  var lat2 = toRad(location2.lat);

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return (Math.round(d * 100) / 100).toFixed(2);
}
function toRad(Value) {
  return (Value * Math.PI) / 180;
}
function calculateNearDrivers(userLocation) {
  const nearDrivers = [];
  for (const [driverId, {driverID, driverLocation,rotation }] of Object.entries(
    drivers
  )) {
    const distanceToWork = calculateDistance(userLocation, driverLocation);
    if (distanceToWork < 5) {
        nearDrivers.push({ driverID, driverLocation, distance:distanceToWork,rotation });
    }
  }
  return nearDrivers;
}

const PORT = process.env.PORT || 4000;
console.log(PORT)
server.listen(PORT, () => {
  console.log(`Server started on PORT : ${PORT}`);
});
