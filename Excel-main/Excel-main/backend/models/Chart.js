import mongoose from 'mongoose';

const chartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true }, // Added fileName field
  title: { type: String, required: true },
  chartType: { type: String, required: true },
  xAxis: { type: String, required: true },
  yAxis: { type: String, required: true },
  data: { type: Object, required: true }, // Chart data subset or transformed from upload
  chartImage: { type: String }, // Base64 encoded chart image
  createdAt: { type: Date, default: Date.now },
}, { collection: 'collection' });

const Chart = mongoose.model('Chart', chartSchema);
export default Chart;
