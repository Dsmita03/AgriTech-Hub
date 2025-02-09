import os
import tensorflow as tf
from tensorflow import keras 
from keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization, GlobalAveragePooling2D
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau, TensorBoard
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import numpy as np
from sklearn.utils.class_weight import compute_class_weight
from collections import Counter

# ✅ Paths
DATASET_PATH = "dataset/"
TRAIN_DIR = os.path.join(DATASET_PATH, "train")
VALID_DIR = os.path.join(DATASET_PATH, "val")

# ✅ Hyperparameters
IMG_SIZE = (224, 224)  # Using 224x224 for MobileNetV2
BATCH_SIZE = 32
EPOCHS = 25
LEARNING_RATE = 0.0005

# ✅ Data Augmentation (More Robust)
train_datagen = ImageDataGenerator(
    rescale=1.0/255,
    rotation_range=45,
    width_shift_range=0.3,
    height_shift_range=0.3,
    shear_range=0.3,
    zoom_range=0.4,
    horizontal_flip=True,
    brightness_range=[0.2, 1.5],
    channel_shift_range=30.0,
    fill_mode="nearest"
)

val_datagen = ImageDataGenerator(rescale=1.0/255)

train_generator = train_datagen.flow_from_directory(
    TRAIN_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    shuffle=True
)

val_generator = val_datagen.flow_from_directory(
    VALID_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical"
)

# ✅ Compute Class Weights to Handle Imbalance
class_counts = np.bincount(train_generator.classes)
total_samples = sum(class_counts)
class_weights = {i: total_samples / (len(class_counts) * class_counts[i]) for i in range(len(class_counts))}

print("✅ Computed Class Weights:", class_weights)

# ✅ Load Pretrained MobileNetV2 Model
base_model = MobileNetV2(input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3), include_top=False, weights="imagenet")
base_model.trainable = False  # Freeze base layers initially

# ✅ Define Optimized Model
model = Sequential([
    base_model,
    GlobalAveragePooling2D(),
    BatchNormalization(),
    Dense(256, activation="relu"),
    Dropout(0.5),
    Dense(len(train_generator.class_indices), activation="softmax")
])

# ✅ Compile Model with Learning Rate Scheduler
lr_schedule = tf.keras.optimizers.schedules.ExponentialDecay(
    initial_learning_rate=LEARNING_RATE,
    decay_steps=10000,
    decay_rate=0.85,
    staircase=True
)
optimizer = keras.optimizers.AdamW(learning_rate=lr_schedule)

model.compile(
    optimizer=optimizer,
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

# ✅ Callbacks
early_stopping = EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True)
model_checkpoint = ModelCheckpoint("model/best_model.keras", save_best_only=True)
lr_scheduler = ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=2, verbose=1)
tensorboard_callback = TensorBoard(log_dir="logs", histogram_freq=1)

callbacks = [early_stopping, model_checkpoint, lr_scheduler, tensorboard_callback]

# ✅ Train Model with Class Weights
history = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=EPOCHS,
    class_weight=class_weights,
    callbacks=callbacks
)

# ✅ Unfreeze Some Layers for Fine-Tuning
base_model.trainable = True
for layer in base_model.layers[:100]:  # Freeze first 100 layers, fine-tune the rest
    layer.trainable = False

# ✅ Continue Training (Fine-Tuning)
history_finetune = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=10,
    class_weight=class_weights,
    callbacks=callbacks
)

# ✅ Save Final Model in Both Formats
model.save("model/plant_disease_model.keras")  # Keras format
model.save("model/plant_disease_model")  # TensorFlow SavedModel format

print("✅ Model training completed & saved successfully!")
