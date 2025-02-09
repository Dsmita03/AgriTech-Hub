import os
import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
import matplotlib.pyplot as plt


# ✅ Load the trained model
MODEL_PATH = "model/best_model.keras"
if not os.path.exists(MODEL_PATH): 
    raise FileNotFoundError(f"🚨 Model file not found: {MODEL_PATH}")

model = tf.keras.models.load_model(MODEL_PATH)
print("✅ Model loaded successfully!")

 
# ✅ Define class names (Updated to match training dataset)
CLASS_NAMES = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
    "Blueberry___healthy", "Cherry_(including_sour)___Powdery_mildew", "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot", "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight", "Corn_(maize)___healthy", "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)", "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)", "Peach___Bacterial_spot", "Peach___healthy",
    "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy", "Potato___Early_blight",
    "Potato___Late_blight", "Potato___healthy", "Raspberry___healthy", "Soybean___healthy",
    "Squash___Powdery_mildew", "Strawberry___Leaf_scorch", "Strawberry___healthy",
    "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___Late_blight",
    "Tomato___Leaf_Mold", "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite", "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Tomato_mosaic_virus", "Tomato___healthy"
]

 
# ✅ Image Preprocessing Function
def preprocess_image(img_path, img_size=(224, 224)):
    img = image.load_img(img_path, target_size=img_size)
    img_array = image.img_to_array(img) / 255.0  # ✅ Normalize between 0 and 1
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    return img_array


# ✅ Function to Predict Disease
def predict_disease(img_path):
    img_array = preprocess_image(img_path)
    predictions = model.predict(img_array)

    print(f"🔍 Raw Predictions: {predictions}")  # Debugging output

    predicted_class_index = np.argmax(predictions)
    confidence = np.max(predictions) * 100  # Confidence percentage
    predicted_label = CLASS_NAMES[predicted_class_index] if predicted_class_index < len(CLASS_NAMES) else "Unknown"

    print(f"🛠 Predicted Index: {predicted_class_index}, Confidence: {confidence:.2f}%")

    plt.imshow(image.load_img(img_path))
    plt.title(f"Predicted: {predicted_label} ({confidence:.2f}%)")
    plt.axis("off")
    plt.show()

    return predicted_label, confidence

# ✅ Test the Model on a Sample Image
test_image_path = os.path.abspath("/Users/debasmitasarkar/Desktop/Greenary/backend/dataset/test/test/CornCommonRust2.JPG")

# ✅ Debugging: Check if file exists
if not os.path.exists(test_image_path):
    raise FileNotFoundError(f"🚨 Image file not found: {test_image_path}")

predicted_label, confidence = predict_disease(test_image_path)

print(f"✅ Predicted Disease: {predicted_label} | Confidence: {confidence:.2f}%")
 
