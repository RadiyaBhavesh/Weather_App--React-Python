import os
import joblib
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor


# =========================================================
# PATH CONFIGURATION
# =========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATASET_PATH = os.path.join(BASE_DIR, "weather.csv")
MODEL_DIR = os.path.join(BASE_DIR, "Model")

os.makedirs(MODEL_DIR, exist_ok=True)


# =========================================================
# LOAD DATASET
# =========================================================

print("Loading dataset...")

df = pd.read_csv(DATASET_PATH)

df = df.dropna()
df = df.drop_duplicates()

print("Dataset shape:", df.shape)


# =========================================================
# RAIN PREDICTION MODEL
# =========================================================

print("\nTraining Rain Prediction Model...")

rain_df = df.copy()

# Wind direction encoder
wind_encoder = LabelEncoder()

rain_df["WindGustDir"] = wind_encoder.fit_transform(
    rain_df["WindGustDir"]
)

# RainTomorrow encoder
rain_encoder = LabelEncoder()

rain_df["RainTomorrow"] = rain_encoder.fit_transform(
    rain_df["RainTomorrow"]
)

features = [
    "MinTemp",
    "MaxTemp",
    "WindGustDir",
    "WindGustSpeed",
    "Humidity",
    "Pressure",
    "Temp"
]

X = rain_df[features]
y = rain_df["RainTomorrow"]


X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


rain_model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

rain_model.fit(X_train, y_train)


print(
    "Rain Train Accuracy:",
    round(rain_model.score(X_train, y_train), 4)
)

print(
    "Rain Test Accuracy:",
    round(rain_model.score(X_test, y_test), 4)
)


# =========================================================
# TEMPERATURE REGRESSION MODEL
# =========================================================

print("\nTraining Temperature Model...")

X_temp = []
y_temp = []

for i in range(len(df) - 1):

    X_temp.append(
        df["Temp"].iloc[i]
    )

    y_temp.append(
        df["Temp"].iloc[i + 1]
    )


X_temp = np.array(X_temp).reshape(-1, 1)
y_temp = np.array(y_temp)


temp_model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

temp_model.fit(X_temp, y_temp)


# =========================================================
# HUMIDITY REGRESSION MODEL
# =========================================================

print("\nTraining Humidity Model...")

X_humidity = []
y_humidity = []

for i in range(len(df) - 1):

    X_humidity.append(
        df["Humidity"].iloc[i]
    )

    y_humidity.append(
        df["Humidity"].iloc[i + 1]
    )


X_humidity = np.array(X_humidity).reshape(-1, 1)
y_humidity = np.array(y_humidity)


humidity_model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

humidity_model.fit(
    X_humidity,
    y_humidity
)


# =========================================================
# SAVE MODELS
# =========================================================

print("\nSaving models...")


joblib.dump(
    rain_model,
    os.path.join(
        MODEL_DIR,
        "rain_model.pkl"
    )
)


joblib.dump(
    temp_model,
    os.path.join(
        MODEL_DIR,
        "temp_model.pkl"
    )
)


joblib.dump(
    humidity_model,
    os.path.join(
        MODEL_DIR,
        "humidity_model.pkl"
    )
)


# =========================================================
# SAVE ENCODERS
# =========================================================

encoders = {
    "wind_encoder": wind_encoder,
    "rain_encoder": rain_encoder,
    "features": features
}

joblib.dump(
    encoders,
    os.path.join(
        MODEL_DIR,
        "encoders.pkl"
    )
)


# =========================================================
# COMPLETE
# =========================================================

print("\n===================================")
print("MODEL TRAINING COMPLETED")
print("===================================")

print("\nSaved files:")

print("Model/rain_model.pkl")
print("Model/temp_model.pkl")
print("Model/humidity_model.pkl")
print("Model/encoders.pkl")