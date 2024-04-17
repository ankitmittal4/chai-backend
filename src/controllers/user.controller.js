import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
const registerUser = asyncHandler(async (req, res) => {
  //   res.status(200).json({
  //     message: "ok",
  //   });

  // Step1: get user details from frontend
  const { fullName, username, password, email } = req.body;
  //handle file such as coverImage and avatar in routes
  console.log("email: ", email);
  console.log("password: ", password);

  // Step2: check validation : if filed is empty
  if (
    [username, email, password, password].some((field) => filed?.trim === "")
  ) {
    throw new ApiError(400, "All fileds are required!!!");
  }

  // Step3: check if user already exists
});

export { registerUser };
