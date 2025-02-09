import tensorflow as tf

# Load your fixed model (adjust the path if necessary)
model = tf.keras.models.load_model("/Users/debasmitasarkar/Desktop/Greenary/backend/model/fixed_model.keras", compile=False)

# Optionally, if you want to ensure the model has a defined input shape:
input_shape = (224, 224, 3)
inputs = tf.keras.layers.Input(shape=input_shape)
outputs = model(inputs, training=False)
model = tf.keras.Model(inputs, outputs)

# Save the model in HDF5 format explicitly
model.save("/Users/debasmitasarkar/Desktop/Greenary/backend/model/fixed_model.h5", save_format="h5")

print("✅ Model successfully saved in HDF5 format!")
