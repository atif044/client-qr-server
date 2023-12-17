exports.isValidName=(lastName)=> {
  return lastName.length >= 3 && lastName.length <= 50;
};

exports.isValidEmail = (email) => {
  const regex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;
  return regex.test(email) && email.length <= 100;
};
exports.isValidPassword = (password) => {
  const exp =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])(?!\s).{8,32}$/;
  return exp.test(password);
};

exports.normalizeEmail=(email)=>{
  return email?.trim().toLowerCase();
}