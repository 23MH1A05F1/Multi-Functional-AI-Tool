import Upload from '../models/Upload.js';

// Delete an upload by ID for the logged-in user
export const deleteUpload = async (req, res) => {
  try {
    const uploadId = req.params.id;
    const userId = req.user.id;

    // Find the upload by ID and userId to ensure ownership
    const upload = await Upload.findOne({ _id: uploadId, userId });
    if (!upload) {
      return res.status(404).json({ message: 'Upload not found or not authorized' });
    }

    await Upload.deleteOne({ _id: uploadId, userId });
    res.json({ message: 'Upload deleted successfully' });
  } catch (err) {
    console.error('Error deleting upload:', err);
    res.status(500).json({ message: 'Server error deleting upload' });
  }
};
