// routes to handle customer requests

import { Router } from "express";
import UserLogic from "../logic/UserLogic.js";
import authenticate from "../middleware/AuthMiddleware.js";
import Utils from "../lib/Utils.js";
import { Consts } from "../lib/Consts.js";
import async from "async";

var UserHandler = Router();

UserHandler.get("/list"/*,authenticate*/, function (req, res) {
  UserLogic.list(req.query,function (result) {   
    res.json(result);
  });
});
// create a user contact
UserHandler.post("/create",/*authenticate,*/ function (req, res) {
 
  UserLogic.create(req.body, function (result) {
    res.json(result);
  });
});
UserHandler.post("/login", function (req, res) {
  UserLogic.login(req.body, function (result) {
    res.json(result);
  });
});

UserHandler.post("/update", function (req, res) {
  UserLogic.update(req.body, function (result) {
    res.json(result);
  });
});
UserHandler.post("/deletePermanently", function (req, res) {
  UserLogic.deletePermanently(req.body, function (result) {
    res.json(result);
  });
});
UserHandler.get("/details/:userId", function (req, res) {
  UserLogic.findById(req.params.userId, function (result) {
    res.json(result);
  });
});


export default UserHandler;