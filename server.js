"use strict";
const express = require("express")
const app = express()
const cluster = require("cluster");
const os = require("os");
const compression = require("compression");
const numClusters = os.cpus().length;
if (cluster.isMaster) {
  for (let i = 0; i < numClusters; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    cluster.fork();
  });
} else {
  app.use(compression());
  app.listen(3000, () => {
    console.log(`${process.pid} started`);
  });
}
const https = require('https');
const getchat = require("./webhook/getchat");
const renbeya = require("./webhook/renbeya");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.end(JSON.stringify(process.versions, null, 2));
});

app.post("/ousama", (req, res) => {
  getchat(req, res);
});

app.post("/renbeyaousama", (req, res) => {
  renbeya(req, res);
});


