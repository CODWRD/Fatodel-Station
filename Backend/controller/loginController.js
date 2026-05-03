const login = require('./../model/loginModel');
exports.loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);

    const user = await login.findOne({ email: email });
    console.log(user);
    if (user && password === user.password) {
      res.status(200).json({
        status: 'success',
        message: 'Login Successful',
      });
    } else {
      res.status(401).json({
        status: 'fail',
        message: 'Invalid Credential',
      });
    }
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
