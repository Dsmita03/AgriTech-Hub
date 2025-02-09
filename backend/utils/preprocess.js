import * as tf from "@tensorflow/tfjs-node";

export const preprocessImage = async (buffer) => {
  let tensor = tf.node.decodeImage(buffer, 3);
  
  // ✅ Resize to (224,224,3)
  tensor = tf.image.resizeBilinear(tensor, [224, 224]);

  // ✅ Normalize (0-255) to (0-1)
  tensor = tensor.div(tf.scalar(255));

  // ✅ Ensure correct shape: [1, 224, 224, 3]
  return tensor.expandDims(0);
};
