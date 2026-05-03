exports.signupController = async (req, res) => {
  const { name, email, password } = req.body;
  const createAccount = login.create(req.body);
  res.status(200).json({ message: 'Data Receieved' });
  console.log(name);
};
