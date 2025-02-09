#!/bin/bash
mkdir -p backend/model

# Install TensorFlow.js Converter
pip install tensorflowjs

# Convert Keras model to TensorFlow.js format
tensorflowjs_converter --input_format keras model/plant_disease_model.h5 backend/model/
echo "✅ Model successfully converted to TensorFlow.js format!"
