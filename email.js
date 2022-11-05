
const nodemailer=require("nodemailer");

function sendMail(name,email,token){

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your email',
    pass: 'your password'
  }
});

const mailOptions = {
  from: 'your email',
  to: email,
  subject: 'Verification code from nodemailer',
  html: "<p style='font-weight:bold'>Hi "+name+"<br><a style='font-weight:bold,color:cyan,text-decoration:none' href='http://localhost:3000/main?id="+email+"&token_id="+token+">Click here to Verify your id</a>"
};
transporter.sendMail(mailOptions, function(error,info){
  if (error) {
    console.log(error)
  } else {
    console.log(info)
  }
})

}

function forget_pass(email, otp){
  const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your email',
    pass: 'your password'
  }
});
const mailOption = {
  from: 'your email',
  to: email,
  subject: 'Verification code from nodemailer',
  text: `One time password is ${otp}`
};
transport.sendMail(mailOption, function(error,info){
  if (error) {
    console.log(error)
  } else {
    console.log(info)
  }
})
}

module.exports = { sendMail, forget_pass};