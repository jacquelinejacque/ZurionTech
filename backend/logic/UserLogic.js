
import async from "async";
import DatabaseManager from "../lib/DatabaseManager.js";
import { Op, Sequelize } from "sequelize";
import { Consts } from "../lib/Consts.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Utils from "../lib/Utils.js";
import { where } from "sequelize";

class UserLogic {
    static list(param, callback) {
        var query = {};

        if (!Utils.isEmpty(param.search) && !Utils.isEmpty(param.search.value)) {
            var query = {
                [Op.or]: [
                    { email: { [Op.like]: `%${param.search.value}%` } },
                    { name: { [Op.like]: `%${param.search.value}%` } },
                    { phone: { [Op.like]: `%${param.search.value}%` } }
                ]
            }
        }
        if (param.userType) query['userType'] = param.userType

        async.waterfall(
            [
                function (done) {
                    DatabaseManager.user
                        .count({ where: query })
                        .then((res) => {
                            done(null, res);
                        })
                        .catch((err) => {
                            done(err);
                        });
                },
                function (totalRecords, done) {

                    DatabaseManager.user
                        .findAll({
                            // logging:console.log,
                            where: query,
                            attributes: ["userID", "shopID", "name", "phone", "email", "expiry", "sysproUser","sysproPassword", "userType"],
                        })
                        .then((res) => {
                            done(null, totalRecords, res);
                        })
                        .catch((err) => {
                            done(err);
                        });
                },
            ],
            function (err, totalRecords, data) {
                if (err)
                    return callback({
                        status: Consts.httpCodeSeverError,
                        message: "Failed to fetch users",
                        error: err,
                        data: [],
                        recordsTotal: 0,
                        recordsFiltered: 0,
                    });

                return callback({
                    status: Consts.httpCodeSuccess,
                    data: data,
                    recordsTotal: totalRecords,
                    recordsFiltered: totalRecords,
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

    static create(body, callback) {
        async.waterfall(
            [
                function (done) {


                    if (Utils.isEmpty(body.name)) {
                        done("Name cannot be empty")
                        return
                    }
                    if (Utils.isEmpty(body.phone)) {
                        done("Phone number is required")
                        return
                    }
                    if (Utils.isEmpty(body.email)) {
                        done("Email is required")
                        return
                    }
                    if (Utils.isEmpty(body.password)) {
                        done("Password is required")
                        return
                    }
                    if (Utils.isEmpty(body.idNumber)) {
                        done("Id Number is required")
                        return
                    }
                    if (Utils.isEmpty(body.dateOfBirth)) {
                        done("Date of birth is required")
                        return
                    } 
                    if (Utils.isEmpty(body.gender)) {
                        done("Gender is required")
                        return
                    }
                    if (Utils.isEmpty(body.organisation)) {
                        done("Organisation is required")
                        return
                    }                    
                    DatabaseManager.user
                        .findOne({
                            where: {
                                email: body.email
                            },
                        })
                        .then((res) => {
                            if (res != undefined) {
                                done("User with similar details already exists");
                                return;
                            }
                            done(null);
                        })
                        .catch((err) => {
                            done(err);
                        });
                },
                function (done) {
                    //
                    var params = {
                        
                        name: body.name,
                        phone: body.phone,
                        email: body.email,
                        idNumber: body.idNumber,
                        dateOfBirth : body.dateOfBirth,
                        gender : body.gender,
                        organisation : body.organisation,
                        password: bcrypt.hashSync(body.password, 8),
                    }
                    DatabaseManager.user
                        .create(params)
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

    static findById(userId, callback) {
        async.waterfall(
            [
                function (done) {
                    DatabaseManager.user
                        .findOne({
                            where: {
                                userID: userId,
                            },
                            attributes: ["userID", "name", "phone", "email", "session", "expiry", "sysproUser", "sysproPassword", "shopID", "userType"],
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
                        status: Consts.httpCodeSeverError,
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

    static update(body, callback) {

        async.waterfall(
            [
                function (done) {

                    DatabaseManager.user
                        .findOne({
                            attributes: ["userID", "name", "phone", "email", "session", "expiry", "sysproUser", "sysproPassword", "shopID", "userType"],
                            where: {
                                userID: body.userId,
                            },
                        })
                        .then((res) => {

                            if (Utils.isEmpty(res)) {
                                done("User not found");
                                return;
                            }
                            done(null);
                        })
                        .catch((err) => {
                            done(err);
                        });
                },
                function (done) {
                    if (body.userType == 'attendant') {
                        if (Utils.isEmpty(body.shop)) {
                            done("Shop is required")
                            return
                        }
                        DatabaseManager.shop
                            .findOne({
                                where: {
                                    shopID: body.shop,
                                },
                            })
                            .then((res) => {
                                if (!res) {
                                    done("The shop provided is not known");
                                    return;
                                }
                                done(null);
                            })
                            .catch((err) => {
                                done(err);
                            });
                        return
                    }
                    done(null);
                },
                function (done) {
                    var params = {
                        name: body.name,
                        phone: body.phone,
                        email: body.email,
                        userType: body.userType,
                        sysproPassword: body.sysproPassword,
                        sysproUser: body.sysproUser
                    }

                    if (body.userType == 'attendant')
                        params['shopID'] = body.shop

                    DatabaseManager.user
                        .update(
                            params,
                            { where: { userID: body.userId } }
                        )
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
                        status: Consts.httpCodeSeverError,
                        message: "Failed to update user",
                        error: err,
                    });

                return callback({
                    status: Consts.httpCodeSuccess,
                    message: "User updated successfully",
                });
            }
        );
    }

    static changePassword(body, callback) {
        async.waterfall(
            [
                function (done) {
                    if (Utils.isEmpty(body.userId)) {
                        done("UserId is required");
                        return;
                    }

                    if (Utils.isEmpty(body.oldPassword)) {
                        done("Old password is required");
                        return;
                    }

                    if (Utils.isEmpty(body.password)) {
                        done("Please provide new password");
                        return;
                    }

                    done(null);
                },

                function (done) {
                    DatabaseManager.user
                        .findOne({
                            attributes: ["userID", "name", "phone", "email", "session", "expiry", "sysproUser", "sysproPassword", "shopID", "userType"],
                            where: { userID: body.userId },
                        })
                        .then((res) => {
                            if (!res) {
                                done("User not found");
                                return;
                            }
                            done(null, res);
                        })
                        .catch((error) => {
                            console.error("Failed to retrieve user:", error);
                            done(`User not found:, ${error.message}`, null);
                        });
                },

                function (user, done) {
                    if (!bcrypt.compareSync(body.oldPassword, user.password)) {
                        done("Incorrect Password!", null);
                        return;
                    }
                    DatabaseManager.user
                        .update(
                            {
                                password: bcrypt.hashSync(body.password, 8),
                            },
                            { where: { userID: body.userId } }
                        )
                        .then((res) => {
                            done(null, "Password updated succesfully");
                        })
                        .catch((error) => {
                            console.error("Error updating password:", error);
                            done(`Error updating password ${error.message}`, null);
                        });
                },
            ],
            function (err, data) {
                if (err) {
                    return callback({
                        status: Consts.httpCodeSeverError,
                        message: err,
                    });
                } else {
                    return callback({
                        status: Consts.httpCodeSuccess,
                        message: data,
                    });
                }
            }
        );
    }


    static resetPassword(body, callback) {
        async.waterfall(
            [
                function (done) {
                    if (Utils.isEmpty(body.userId)) {
                        done("UserId is required");
                        return;
                    }
                    if (Utils.isEmpty(body.password)) {
                        done("password is required");
                        return;
                    }

                    // if (body.password !== body.confirmPassword) {
                    //     done("Passwords do not match");
                    //     return;
                    // }

                    done(null);
                },

                function (done) {
                    DatabaseManager.user
                        .findOne({
                            attributes: ["userID", "name", "phone", "email", "session", "expiry", "sysproUser", "sysproPassword", "shopID", "userType"],
                            where: { userID: body.userId },
                        })
                        .then((user) => {
                            if (user === null) {
                                done("user not found!");
                                return;
                            }
                            done(null, user);
                        })
                        .catch((err) => {
                            console.log("error");
                            done(err, null);
                        });
                },

                function (user, done) {
                    DatabaseManager.user
                        .update(
                            {
                                password: bcrypt.hashSync(body.password, 8),
                            },
                            { where: { userID: user.userID } }
                        )
                        .then((res) => {
                            done(null, "Password reset succesfull");
                        })
                        .catch((error) => {
                            done("Error resetting password", null);
                        });
                },
            ],
            function (err, data) {
                if (err) {
                    return callback({
                        status: Consts.httpCodeSeverError,
                        message: err,
                    });
                } else {
                    return callback({
                        status: Consts.httpCodeSuccess,
                        message: data,
                    });
                }
            }
        );
    }

    static updateSysproSession(body, callback) {

        async.waterfall(
            [
                function (done) {

                    DatabaseManager.user
                        .findOne({
                            attributes: ["userID", "name", "phone", "email", "session", "expiry", "sysproUser", "sysproPassword", "shopID", "userType"],
                            where: {
                                userID: body.userID?body.userID:'',
                            },
                        })
                        .then((res) => {

                            if (Utils.isEmpty(res)) {
                                done("User not found");
                                return;
                            }
                            done(null);
                        })
                        .catch((err) => {
                            done(err);
                        });
                },

                function (done) {
                    var params = {
                        sysproSession: body.session,
                        dateSysproSessionUpdated: Utils.getDateTime(),
                    }
                    DatabaseManager.user
                        .update(params,
                            { where: { userID: body.userID } }
                        ).then((res) => {
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
                        status: Consts.httpCodeSeverError,
                        message: "Failed to update session",
                        error: err,
                    });

                return callback({
                    status: Consts.httpCodeSuccess,
                    message: "User session updated successfully",
                });
            }
        );
    }
}

export default UserLogic;