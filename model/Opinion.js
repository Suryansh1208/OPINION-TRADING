const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 1 }
});

const Counter = mongoose.model('Counter', CounterSchema);

const OpinionSchema = new mongoose.Schema({
  opinion_id: { type: Number, unique: true },
  title: { type: String },
  description: { type: String },
  start_date: { type: Date },
  end_date: { type: Date },  
  news: { type: String },
  status: { type: String },
  source_of_truth: { type: String },
  conditions: {
    rules: { type: String },     
    guidelines: { type: String }
  },
  min_price: { type: Number },
  max_price: { type: Number },
  opinion_type: { type: String },
  final_result: { type: String },
  platform_owner_response : { type: String },
  trade_volume: { type: Number },
  role : {type : String },
  details: {
    createdBy : {type : Number },
    time: { type: Date }
  }
});

OpinionSchema.pre('save', function (next) {
  const doc = this;
  Counter.findByIdAndUpdate(
    { _id: 'opinionId' },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  )
    .then((counter) => {
      doc.opinion_id = counter.sequence_value;
      next();
    })
    .catch((error) => {
      next(error);
    });
});

const Opinion = mongoose.model('Opinion', OpinionSchema);

module.exports = Opinion;
