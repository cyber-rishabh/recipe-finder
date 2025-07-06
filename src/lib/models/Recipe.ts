import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  cuisine: {
    type: String,
    required: true,
    trim: true,
  },
  ingredients: [{
    type: String,
    required: true,
  }],
  instructions: [{
    type: String,
    required: true,
  }],
  imageUrl: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema); 