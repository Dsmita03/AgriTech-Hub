import * as tf from "@tensorflow/tfjs-node";

export const preprocessImage = async (buffer) => {
  const memBefore = tf.memory();
  console.log('Memory before preprocessing:', memBefore.numTensors, 'tensors');
  
  const result = tf.tidy(() => {
    try {
      console.log('Decoding image, buffer size:', buffer.length);
      
      // Decode image as 3-channel tensor
      let tensor = tf.node.decodeImage(buffer, 3);
      console.log('Decoded shape:', tensor.shape);
      
      // Resize to 224x224
      tensor = tf.image.resizeBilinear(tensor, [224, 224]);
      console.log('Resized shape:', tensor.shape);
      
      // Normalize from 0-255 to 0-1
      tensor = tensor.div(tf.scalar(255));
      console.log('Normalized');
      
      // Ensure batch dimension: [1, 224, 224, 3]
      const batched = tensor.expandDims(0);
      console.log('Final shape:', batched.shape);
      
      return batched;
      
    } catch (error) {
      console.error('Preprocessing error:', error);
      throw new Error("Image preprocessing failed: " + error.message);
    }
  });
  
  const memAfter = tf.memory();
  console.log('Memory after preprocessing:', memAfter.numTensors, 'tensors');
  
  return result;
};
