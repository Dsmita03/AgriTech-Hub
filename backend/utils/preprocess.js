import * as tf from "@tensorflow/tfjs-node";

export const preprocessImage = async (buffer) => {
  try {
    // Decode image as 3-channel tensor
    let tensor = tf.node.decodeImage(buffer, 3);
    // Resize to 224x224
    tensor = tf.image.resizeBilinear(tensor, [224, 224]);
    // Normalize from 0-255 to 0-1
    tensor = tensor.div(tf.scalar(255));
    // Ensure batch dimension: [1, 224, 224, 3]
    return tensor.expandDims(0);
  } catch (error) {
    throw new Error("Image preprocessing failed: " + error.message);
  }
};
