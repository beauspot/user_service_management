import AsyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";

export const dashboardCtrl = AsyncHandler((req, res) => {
  const username = req.user.username;
  if (username) {
    res.send(`Welcome to Your Dashboard, ${username}!`);
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json("Not logged in");
  }
});
