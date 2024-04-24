import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinay } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = asyncHandler(async (userId) => {
  try {
    const user = await findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong");
  }
});
const registerUser = asyncHandler(async (req, res) => {
  //   res.status(200).json({
  //     message: "ok",
  //   });

  // Step1: get user details from frontend
  const { fullName, username, password, email } = req.body;
  //handle file such as coverImage and avatar in routes
  console.log("---------------------------------------------------");
  // console.log("Req Body: ", req.body);

  // Step2: check validation : if filed is empty
  if (
    [username, email, fullName, password].some((field) => field?.trim === "")
  ) {
    console.log("All fields are required");
    throw new ApiError(400, "All fields are required!!!");
  }

  // Step3: check if user already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  // console.log("Existed user: ", existedUser);
  if (existedUser) {
    console.log("User with this username or email already exists!!!");
    throw new ApiError(
      409,
      "User with this username or email already exists!!!"
    );
  }

  // Step4: check for images and avatar
  // console.log("Req.files: ", req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  if (!avatarLocalPath) {
    console.log("Avatar is required!!!");
    throw new ApiError(400, "Avatar is required!!!");
  }

  // Step5: upload on cloudinary
  const avatar = await uploadOnCloudinay(avatarLocalPath);
  const coverImage = await uploadOnCloudinay(coverImageLocalPath);
  if (!avatar) {
    console.log("Avatar is required!!! Cloudinary");
    throw new ApiError(400, "Avatar is required!!!");
  }

  // Step6: create entry in data base
  const user = await User.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // Step7: remove password and refresh token
  // const createdUser = User.findById(user._id).select("-password -refreshToken");
  const createdUserQuery = User.findById(user._id).select(
    "-password -refreshToken"
  );
  const createdUser = await createdUserQuery.exec();
  console.log("Created User: ", createdUser);

  // Step8: check for user creation
  if (!createdUser) {
    console.log("Sonmething went wrong while registering the user");
    throw new ApiError(500, "Sonmething went wrong while registering the user");
  }

  // Step9: return response

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //step1: get data from req body
  const { username, email, password } = req.body;
  //step2: check user with email or username
  if (!username || !email) {
    throw new ApiError(400, "No username or email!");
  }

  //step3: Find the user
  const user = await User.findOne({
    $or: [{ email, username }],
  });
  if (!user) {
    throw new ApiError(401, "Invalid username or email!");
  }

  //step4: check password
  const isPasswordCorrect = user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid user credentials!");
  }

  const { accessToken, refreshToken } = generateAccessAndRefreshToken(user._id);

  const loggedinUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedinUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {});

export { registerUser, loginUser, logoutUser };
