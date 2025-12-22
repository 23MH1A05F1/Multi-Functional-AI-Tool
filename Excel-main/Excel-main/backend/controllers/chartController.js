import Chart from '../models/Chart.js';

export const saveChart = async (req, res) => {
  const { fileName, title, chartType, xAxis, yAxis, data, chartImage } = req.body;
  if (!fileName || !title || !chartType || !xAxis || !yAxis || !data) {
    return res.status(400).json({ message: 'Missing required chart fields' });
  }
  try {
    const newChart = new Chart({
      userId: req.user.id,
      fileName,
      title,
      chartType,
      xAxis,
      yAxis,
      data,
      chartImage,
    });
    await newChart.save();
    res.status(201).json({ chart: newChart });
  } catch (err) {
    console.error('Error saving chart:', err);
    res.status(500).json({ message: 'Server error saving chart' });
  }
};

// Get charts for logged-in user
export const getUserCharts = async (req, res) => {
  try {
    // Select chart details including chartImage
    const charts = await Chart.find({ userId: req.user.id })
      .select('fileName title chartType xAxis yAxis createdAt chartImage')
      .sort({ createdAt: -1 });
    res.json({ charts });
  } catch (err) {
    console.error('Error fetching user charts:', err);
    res.status(500).json({ message: 'Server error fetching charts' });
  }
};

// Delete chart by ID for logged-in user
export const deleteChart = async (req, res) => {
  const chartId = req.params.id;
  try {
    const chart = await Chart.findOne({ _id: chartId, userId: req.user.id });
    if (!chart) {
      return res.status(404).json({ message: 'Chart not found' });
    }
    await Chart.deleteOne({ _id: chartId });
    res.json({ message: 'Chart deleted successfully' });
  } catch (err) {
    console.error('Error deleting chart:', err);
    res.status(500).json({ message: 'Server error deleting chart' });
  }
};
