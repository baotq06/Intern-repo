// Import Mongoose
import mongoose from 'mongoose';


// Define the Mongoose schema
const testSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  { collection: 'users' }
);

// Create the Mongoose model
const TestModel = mongoose.model('users', testSchema);



export default TestModel;
