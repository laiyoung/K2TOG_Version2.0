const userModel = require('./userModel');
const classModel = require('./classModel');
const enrollmentModel = require('./enrollmentModel');
const paymentModel = require('./paymentModel'); 

module.exports = {
  ...userModel,
  ...classModel,
  ...enrollmentModel,
  ...paymentModel, 
};
