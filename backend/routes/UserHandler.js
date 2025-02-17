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

UserHandler.post("/update",authenticate, function (req, res) {
  UserLogic.update(req.body, function (result) {
    res.json(result);
  });
});
UserHandler.get("/details/:userId",authenticate, function (req, res) {
  UserLogic.findById(req.params.userId, function (result) {
    res.json(result);
  });
});
UserHandler.post("/password/change",authenticate, (req, res) => {
  UserLogic.changePassword(req.body, (results) => {
    res.json(results);
  });
});
 

UserHandler.post("/password/reset", (req, res) => {
  UserLogic.resetPassword(req.body, (results) => {
    res.json(results);
  });
}); 

UserHandler.post("/syspro/session"/*,authenticate*/, function (req, res) {
  var results=[]
  if (Utils.isEmpty(req.body.data)) {
    return res.json([{
        status:Consts.httpCodeSeverError,
        message: "Atleast one inventory item is required",
    }]);
}
  async.eachSeries(req.body.data, function (param, next) {
    UserLogic.updateSysproSession(param, function (result) {
      results.push(result)
      return next()
    });
}, function (err, data) {
    res.json(results);
})
  
});

 

export default UserHandler;