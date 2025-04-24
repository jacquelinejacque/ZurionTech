
import async from "async";
import DatabaseManager from "../lib/DatabaseManager.js";
import { Op, Sequelize } from "sequelize";
import { Consts } from "../lib/Consts.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import Utils from "../lib/Utils.js";
import { where } from "sequelize";

class UserLogic {

    static create(body, callback) {
        async.waterfall(
          [
            function (done) {
              if (Utils.isEmpty(body.name)) return done("Name cannot be empty");
              if (Utils.isEmpty(body.phone)) return done("Phone number is required");
              if (Utils.isEmpty(body.email)) return done("Email is required");
              if (Utils.isEmpty(body.password)) return done("Password is required");
              if (Utils.isEmpty(body.idNumber)) return done("Id Number is required");
              if (Utils.isEmpty(body.dateOfBirth)) return done("Date of birth is required");
              if (Utils.isEmpty(body.gender)) return done("Gender is required");
              if (Utils.isEmpty(body.organisation)) return done("Organisation is required");
    
              // Check if user already exists
              DatabaseManager.user
                .findOne({ where: { email: body.email } })
                .then((res) => {
                  if (res) return done("User with similar details already exists");
                  done(null);
                })
                .catch((err) => done(err));
            },
    
            function (done) {
              // Utility functions for masking and hashing
              const maskName = (name) => {
                const first = name.split(" ")[0];
                return `${first} ***`;
              };
    
              const maskPhone = (phone) => {
                return phone.slice(0, 6) + "***" + phone.slice(-3);
              };
    
              const hashPhone = (phone) => {
                return crypto.createHash("sha256").update(phone).digest("hex");
              };
    
              // Prepare params to insert
              const params = {
                name: body.name,
                phone: body.phone,
                email: body.email,
                idNumber: body.idNumber,
                dateOfBirth: body.dateOfBirth,
                gender: body.gender,
                organisation: body.organisation,
                password: bcrypt.hashSync(body.password, 8),
    
                // Masked + hashed values
                maskedName: maskName(body.name),
                maskedPhone: maskPhone(body.phone),
                hashedPhone: hashPhone(body.phone),
              };
    
              DatabaseManager.user
                .create(params)
                .then((res) => done(null, res))
                .catch((err) => done(err));
            },
          ],
          function (err, data) {
            if (err)
              return callback({
                status: Consts.httpCodeServerError,
                message: "Failed to create user",
                error: err,
              });
    
            return callback({
              status: Consts.httpCodeSuccess,
              message: "User created successfully",
            });
          }
        );
    }

    static login(body, callback) {

      async.waterfall(
          [
              function (done) {
                  DatabaseManager.user
                      .findOne({
                          attributes: ["userID", "name", "phone", "email", "idNumber", "password", "dateOfBirth", "gender","organisation", ],
                          where: {
                              email: body.username,
                          },
                      })
                      .then((res) => {
                          if (res == undefined) {
                              done("Invalid credentials");
                              return;
                          }
                          done(null, res);
                      })
                      .catch((err) => {
                          done(err);
                      });
              },
              function (user, done) {
                  if (bcrypt.compareSync(body.password, user.password)) {
                      //generate and update a session
                      var params = {
                          session: Utils.randomString(40),
                          expiry: Utils.addTimeToDate(0, 0, 1, 0, 0)
                      }

                      DatabaseManager.user
                          .update(params, {
                              where: {
                                  email: user.email,
                              },
                          })
                          .then((res) => {
                              done(null, user);
                          })
                          .catch((err) => {
                              console.log(err)
                              done(err);
                          });
                  } else {

                      done("Invalid credentials");
                  }
              }, 
          
              function (user, done) {
                  DatabaseManager.user
                      .findOne({
                          attributes: ["userID", "name", "phone", "session", "email", "idNumber", "expiry", "dateOfBirth", "gender", "organisation"],   
                          where: {
                              email: user.email,
                          },
                      })
                      .then((res) => {
                         
                          let jwtToken = jwt.sign(
                              {
                                  session: res.session,
                                  expiry: res.expiry,
                                  name: res.name,
                                  email: res.email,
                              },
                              process.env["JWT_KEY"],
                              { expiresIn: process.env["JWT_EXPIRY_TIME"] });

                          done(null, jwtToken, res);
                      })
                      .catch((err) => {
                          console.log(err)
                          done(err);
                      });
              }
          ],
          function (err, token, user) {

              if (err) {
                  return callback({
                      status: Consts.httpCodeServerError,
                      message: "Failed to login",
                      error: err,
                  });
              }

              // console.log(user)
              return callback({
                  status: Consts.httpCodeSuccess,
                  token: token,
                  data: user,
              });
          }
      );
    }
    static findById(userId, callback) {
        async.waterfall(
            [
                function (done) {
                    DatabaseManager.user
                        .findOne({
                            where: {
                                userID: userId,
                            },
                            attributes: ["userID", "name", "phone", "email", "password", "idNumber", "dateOfBirth", "gender", "organisation", "maskedName", "maskedPhone", "hashedPhone"],
                        })
                        .then((res) => {
                            done(null, res);
                        })
                        .catch((err) => {
                            done(err);
                        });
                },
            ],

            function (err, data) {
                if (err)
                    return callback({
                        status: Consts.httpCodeServerError,
                        message: "Error fetching user",
                        error: err,
                    });

                return callback({
                    status: Consts.httpCodeSuccess,
                    user: data,
                });
            }
        );
    }
    static list(param, callback) {
        const query = { status: "active" };
        if (!Utils.isEmpty(param.search) && !Utils.isEmpty(param.search.value)) {
          query[Op.or] = [
            { idNumber: { [Op.like]: `%${param.search.value}%` } },
            { email: { [Op.like]: `%${param.search.value}%` } },
            { phone: { [Op.like]: `%${param.search.value}%` } },
            { name: { [Op.like]: `%${param.search.value}%` } },
            { organisation: { [Op.like]: `%${param.search.value}%` } },
          ];
        }
    
        async.waterfall(
          [
            function (done) {
              DatabaseManager.user
                .count({ where: query })
                .then((totalRecords) => done(null, totalRecords))
                .catch((err) => done(err));
            },
            function (totalRecords, done) {

              const offset = parseInt(param.start) || 0;
              const limit = parseInt(param.length) || 10;              
              DatabaseManager.user
                .findAll({
                  where: query,
                  attributes: ["userID", "name", "phone", "email", "idNumber", "dateOfBirth", "gender", "organisation", "maskedName", "maskedPhone", "hashedPhone"],
                  order: [["createdAt", "DESC"]],
                  offset: offset,
                  limit: limit,                  
                })
                .then((data) => done(null, totalRecords, data))
                .catch((err) => done(err));
            },
          ],
          function (err, totalRecords, data) {
            if (err) {
              return callback({
                status: Consts.httpCodeServerError,
                message: "Failed to fetch User Contacts",
                error: err,
                data: [],
                recordsTotal: 0,
                recordsFiltered: 0,
              });
            }
    
            return callback({
              status: Consts.httpCodeSuccess,
              message: "User Contacts fetched successfully",
              data: data,
              draw: parseInt(param.draw), 
              recordsTotal: totalRecords,
              recordsFiltered: totalRecords,
            });
          }
        );
    }
    static update(body, callback) {
        async.waterfall(
          [
            function (done) {
              DatabaseManager.user
                .findOne({
                  attributes: ["userID", "name", "phone", "email", "idNumber", "dateOfBirth", "gender", "organisation", "maskedName", "maskedPhone", "hashedPhone"],
                  where: { userID: body.userId },
                })
                .then((res) => {
                  if (Utils.isEmpty(res)) {
                    return done("User not found");
                  }
                  done(null);
                })
                .catch((err) => {
                  console.error("Find error:", err);
                  done(err);
                });
            },
      
            function (done) {
              const params = {
                name: body.name,
                phone: body.phone,
                email: body.email,
                dateOfBirth: body.dateOfBirth,
                organisation: body.organisation,
                idNumber: body.idNumber,
                gender: body.gender
              };
      
              DatabaseManager.user
                .update(params, { where: { userID: body.userId } })
                .then((res) => {
                  done(null, res);
                })
                .catch((err) => {
                  console.error("Update error:", err);
                  done(err);
                });
            },
          ],
      
          function (err, data) {
            if (err) {
              const errorMessage = typeof err === 'string' ? err : (err.message || "Internal server error");
              return callback({
                status: Consts.httpCodeServerError,
                message: "Failed to update user",
                error: errorMessage,
              });
            }
      
            return callback({
              status: Consts.httpCodeSuccess,
              message: "User updated successfully",
            });
          }
        );
    }
      
    static deletePermanently(body, callback) {
        async.waterfall(
          [
            function (done) {
              if (Utils.isEmpty(body.userId)) {
                return done("user ID cannot be empty");
              }
              DatabaseManager.user
                .findOne({
                  attributes: ["userID", "name", "phone", "email", "idNumber", "dateOfBirth", "gender", "organisation", "maskedName", "maskedPhone", "hashedPhone"],
                  where: { userID: body.userId, status: "active" },
                })
                .then((res) => {
                  if (Utils.isEmpty(res)) {
                    return done("User Contact not found ");
                  }
                  done(null, res); 
                })
                .catch((err) => done(err)); 
            },
            function (user, done) {
              if (body.feedback.toLowerCase() === 'yes') {
                DatabaseManager.user
                  .destroy({ where: { userID: user.userID } })
                  .then(() => {
                    done(null, user); 
                  })
                  .catch((err) => done(err)); 
              } else {
                done("Deletion cancelled by user"); 
              }
            },
          ],
          function (err, result) {
            if (err) {
              return callback({
                status: Consts.httpCodeServerError,
                message: "Failed to delete user Contact permanently",
                error: err,
              });
            }
    
            return callback({
              status: Consts.httpCodeSuccess,
              message: "User Contact deleted permanently",
              data: result,
            });
          }
        );
    }

}

export default UserLogic;