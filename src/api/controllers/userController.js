import UserModel from "../model/userModel.js";
import UnauthenticatedError from "../helpers/unauthenticated.js";
import AsyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";

export const signupUser = AsyncHandler(async (req, res) => {
  const newUser = await UserModel.create({ ...req.body });
  const userToken = newUser.createJWT();

  return res
    .status(StatusCodes.CREATED)
    .json({ UserData: { userName: newUser.username }, token: userToken });
});

export const loginUser = AsyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const uname = req.body.username;
  if (!username || !password) {
    throw new UnauthenticatedError(
      "Invalid username or password",
      StatusCodes.NON_AUTHORITATIVE_INFORMATION
    );
  }

  const userExists = await UserModel.findOne({ username });
  req.session.username = uname;

  if (!userExists) {
    throw new UnauthenticatedError(
      `The user ${username} does not exist`,
      StatusCodes.UNAUTHORIZED
    );
  }

  // comparing the user pwds
  const isMatch = await userExists.comparePwd(password);

  if (!isMatch) {
    throw new UnauthenticatedError(
      `The user credentials do not match`,
      StatusCodes.UNAUTHORIZED
    );
  } else {
    const usertoken = userExists.createJWT();
    return res.status(StatusCodes.OK).json({
      userDate: { userEmail: userExists.email },
      Token: usertoken,
    });
  }
});
