import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  //   res.status(200).json({
  //     message: "ok",
  //   });

  const { fullName, username, password, email } = req.body;

  console.log("email: ", email);
  console.log("password: ", password);
});

export { registerUser };
