"use strict";
const express = require("express")
const app = express()
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

app.listen(3000, () => {
    console.log(`${process.pid} started`);
});
