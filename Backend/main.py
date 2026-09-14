import os
from datetime import datetime, timedelta

import requests
import joblib
import pandas as pd
import pytz

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware


# =========================================================
# 1. CONFIGURATION
# =========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

ENV_PATH = os.path.join(BASE_DIR, ".env")

MODEL_DIR = os.path.join(BASE_DIR, "Model")


# =========================================================
# 2. LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv(ENV_PATH)

API_KEY = os.getenv("OPENWEATHER_API_KEY")

if not API_KEY:
    raise RuntimeError(
        "OPENWEATHER_API_KEY not found in .env"
    )


# =========================================================
# 3. OPENWEATHER CONFIGURATION
# =========================================================

BASE_URL = "https://api.openweathermap.org/data/2.5/"


# =========================================================
# 4. MODEL FILE PATHS
# =========================================================

RAIN_MODEL_PATH = os.path.join(
    MODEL_DIR,
    "rain_model.pkl"
)

TEMP_MODEL_PATH = os.path.join(
    MODEL_DIR,
    "temp_model.pkl"
)

HUMIDITY_MODEL_PATH = os.path.join(
    MODEL_DIR,
    "humidity_model.pkl"
)

ENCODERS_PATH = os.path.join(
    MODEL_DIR,
    "encoders.pkl"
)


# =========================================================
# 5. CHECK MODEL FILES
# =========================================================

required_model_files = [
    RAIN_MODEL_PATH,
    TEMP_MODEL_PATH,
    HUMIDITY_MODEL_PATH,
    ENCODERS_PATH
]

for model_file in required_model_files:

    if not os.path.exists(model_file):

        raise RuntimeError(
            f"Model file not found: {model_file}\n"
            f"Please run train_model.py first."
        )


# =========================================================
# 6. LOAD TRAINED MODELS
# =========================================================
#
# IMPORTANT:
# Models are loaded ONLY ONCE when FastAPI starts.
#
# They are NOT trained again for every API request.
# =========================================================

print("\n===================================")
print("Loading trained ML models...")
print("===================================")


rain_model = joblib.load(
    RAIN_MODEL_PATH
)

temp_model = joblib.load(
    TEMP_MODEL_PATH
)

humidity_model = joblib.load(
    HUMIDITY_MODEL_PATH
)

encoders = joblib.load(
    ENCODERS_PATH
)


# Load encoders

wind_encoder = encoders["wind_encoder"]

rain_encoder = encoders["rain_encoder"]

features = encoders["features"]


print("Rain model loaded successfully")
print("Temperature model loaded successfully")
print("Humidity model loaded successfully")
print("Encoders loaded successfully")

print("\nModels are ready.")
print("===================================\n")


# =========================================================
# 7. FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="Weather AI API",
    description=(
        "Weather Application using OpenWeather API "
        "and Pre-trained Machine Learning Models"
    ),
    version="1.0.0"
)


# =========================================================
# 8. CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)
# =========================================================
# 9. FETCH CURRENT WEATHER DATA
# =========================================================

def get_current_data(city):

    if not API_KEY:

        raise HTTPException(
            status_code=500,
            detail="Weather service is not configured properly. Please try again later."
        )

    url = f"{BASE_URL}weather"

    params = {
        "q": city,
        "appid": API_KEY,
        "units": "metric"
    }

    try:

        response = requests.get(
            url,
            params=params,
            timeout=10
        )

        # Try to read JSON response
        try:
            data = response.json()
        except ValueError:
            data = {}

    # -----------------------------------------------------
    # INTERNET / CONNECTION ERROR
    # -----------------------------------------------------

    except requests.exceptions.ConnectionError:

        raise HTTPException(
            status_code=503,
            detail=(
                "No Internet Connection. "
                "Please check your internet connection and try again."
            )
        )

    # -----------------------------------------------------
    # REQUEST TIMEOUT
    # -----------------------------------------------------

    except requests.exceptions.Timeout:

        raise HTTPException(
            status_code=504,
            detail=(
                "Weather service is taking too long to respond. "
                "Please try again later."
            )
        )

    # -----------------------------------------------------
    # OTHER REQUEST ERROR
    # -----------------------------------------------------

    except requests.exceptions.RequestException:

        raise HTTPException(
            status_code=503,
            detail=(
                "Unable to connect to the weather service. "
                "Please try again later."
            )
        )

    # =====================================================
    # OPENWEATHER RESPONSE STATUS
    # =====================================================

    if response.status_code != 200:

        # -------------------------------------------------
        # INVALID API KEY
        # -------------------------------------------------

        if response.status_code == 401:

            raise HTTPException(
                status_code=502,
                detail=(
                    "Weather service authentication failed. "
                    "Please try again later."
                )
            )

        # -------------------------------------------------
        # CITY NOT FOUND
        # -------------------------------------------------

        if response.status_code == 404:

            raise HTTPException(
                status_code=404,
                detail=(
                    f"City '{city}' was not found. "
                    "Please check the city name and try again."
                )
            )

        # -------------------------------------------------
        # TOO MANY REQUESTS
        # -------------------------------------------------

        if response.status_code == 429:

            raise HTTPException(
                status_code=429,
                detail=(
                    "Weather service request limit reached. "
                    "Please try again later."
                )
            )

        # -------------------------------------------------
        # OTHER API ERROR
        # -------------------------------------------------

        raise HTTPException(
            status_code=503,
            detail=(
                "Weather service is currently unavailable. "
                "Please try again later."
            )
        )

    # =====================================================
    # WEATHER DATA
    # =====================================================

    wind_data = data.get(
        "wind",
        {}
    )

    return {

        "city":
            data["name"],

        "country":
            data["sys"]["country"],

        "current_temp":
            round(
                data["main"]["temp"]
            ),

        "feel_like":
            round(
                data["main"]["feels_like"]
            ),

        "temp_min":
            round(
                data["main"]["temp_min"]
            ),

        "temp_max":
            round(
                data["main"]["temp_max"]
            ),

        "humidity":
            round(
                data["main"]["humidity"]
            ),

        "description":
            data["weather"][0]["description"],

        "wind_gust_dir":
            wind_data.get(
                "deg",
                0
            ),

        "pressure":
            data["main"]["pressure"],

        "Wind_Gust_Speed":
            wind_data.get(
                "speed",
                0
            )
    }

# =========================================================
# 10. FUTURE PREDICTION
# =========================================================

def predict_future(
    model,
    current_value
):

    predictions = [
        current_value
    ]

    for _ in range(5):

        next_value = model.predict(

            [
                [predictions[-1]]
            ]

        )

        predictions.append(
            next_value[0]
        )

    return predictions[1:]


# =========================================================
# 11. WIND DIRECTION
# =========================================================

def get_compass_direction(
    degrees
):

    directions = [

        "N",
        "NNE",
        "NE",
        "ENE",
        "E",
        "ESE",
        "SE",
        "SSE",
        "S",
        "SSW",
        "SW",
        "WSW",
        "W",
        "WNW",
        "NW",
        "NNW"

    ]

    index = int(
        (degrees + 11.25) / 22.5
    ) % 16

    return directions[index]


# =========================================================
# 12. WEATHER ANALYSIS
# =========================================================

def analyze_weather(city):

    # -----------------------------------------------------
    # Current weather from OpenWeather
    # -----------------------------------------------------

    current_data = get_current_data(
        city
    )


    # -----------------------------------------------------
    # Wind direction
    # -----------------------------------------------------

    wind_deg = (
        current_data[
            "wind_gust_dir"
        ] % 360
    )

    compass_direction = (
        get_compass_direction(
            wind_deg
        )
    )


    # -----------------------------------------------------
    # Encode wind direction
    # -----------------------------------------------------
    #
    # IMPORTANT:
    # Do NOT fit LabelEncoder again.
    #
    # We use the same encoder that was
    # saved during model training.
    # -----------------------------------------------------

    if (
        compass_direction
        in wind_encoder.classes_
    ):

        wind_encoded = (
            wind_encoder.transform(
                [compass_direction]
            )[0]
        )

    else:

        # Unknown wind direction
        # fallback to first known class

        wind_encoded = 0


    # -----------------------------------------------------
    # Prepare Rain Model Input
    # -----------------------------------------------------

    current_features = {

        "MinTemp":
            current_data[
                "temp_min"
            ],

        "MaxTemp":
            current_data[
                "temp_max"
            ],

        "WindGustDir":
            wind_encoded,

        "WindGustSpeed":
            current_data[
                "Wind_Gust_Speed"
            ],

        "Humidity":
            current_data[
                "humidity"
            ],

        "Pressure":
            current_data[
                "pressure"
            ],

        "Temp":
            current_data[
                "current_temp"
            ]
    }


    current_df = pd.DataFrame(
        [current_features],
        columns=features
    )


    # =====================================================
    # RAIN PREDICTION
    # =====================================================

    rain_prediction = (
        rain_model.predict(
            current_df
        )[0]
    )


    # =====================================================
    # RAIN PROBABILITY
    # =====================================================

    rain_probability = None

    if hasattr(
        rain_model,
        "predict_proba"
    ):

        probabilities = (
            rain_model.predict_proba(
                current_df
            )[0]
        )

        # Probability of Rain = class 1
        if 1 in rain_model.classes_:

            rain_class_index = list(
                rain_model.classes_
            ).index(1)

            rain_probability = round(
                float(
                    probabilities[
                        rain_class_index
                    ]
                ) * 100,
                2
            )

        else:

            rain_probability = round(
                float(
                    max(probabilities)
                ) * 100,
                2
            )


    # =====================================================
    # TEMPERATURE PREDICTION
    # =====================================================

    future_temp = predict_future(

        temp_model,

        current_data[
            "current_temp"
        ]
    )


    # =====================================================
    # HUMIDITY PREDICTION
    # =====================================================

    future_hum = predict_future(

        humidity_model,

        current_data[
            "humidity"
        ]
    )


    # =====================================================
    # INDIA TIME
    # =====================================================

    timezone = pytz.timezone(
        "Asia/Kolkata"
    )

    now = datetime.now(
        timezone
    )

    next_hour = (
        now.replace(
            minute=0,
            second=0,
            microsecond=0
        )
        + timedelta(hours=1)
    )


    future_time = [

        (
            next_hour
            + timedelta(hours=i)
        ).strftime("%H:00")

        for i in range(5)
    ]


    # =====================================================
    # FUTURE TEMPERATURE
    # =====================================================

    future_temperature = []

    for time, temp in zip(
        future_time,
        future_temp
    ):

        future_temperature.append({

            "time":
                time,

            "temperature":
                round(
                    float(temp),
                    1
                )
        })


    # =====================================================
    # FUTURE HUMIDITY
    # =====================================================

    future_humidity = []

    for time, humidity in zip(
        future_time,
        future_hum
    ):

        future_humidity.append({

            "time":
                time,

            "humidity":
                round(
                    float(humidity),
                    1
                )
        })


    # =====================================================
    # FINAL JSON RESPONSE
    # =====================================================

    return {

        "city":
            current_data[
                "city"
            ],

        "country":
            current_data[
                "country"
            ],

        "temperature":
            current_data[
                "current_temp"
            ],

        "feels_like":
            current_data[
                "feel_like"
            ],

        "min_temperature":
            current_data[
                "temp_min"
            ],

        "max_temperature":
            current_data[
                "temp_max"
            ],

        "humidity":
            current_data[
                "humidity"
            ],

        "pressure":
            current_data[
                "pressure"
            ],

        "wind_speed":
            current_data[
                "Wind_Gust_Speed"
            ],

        "wind_direction":
            compass_direction,

        "wind_degree":
            wind_deg,

        "description":
            current_data[
                "description"
            ],

        "rain_prediction":
            (
                "Yes"
                if rain_prediction == 1
                else "No"
            ),

        "rain_probability":
            rain_probability,

        "future_temperature":
            future_temperature,

        "future_humidity":
            future_humidity
    }


# =========================================================
# 13. ROOT API
# =========================================================

@app.get("/")
def home():

    return {

        "message":
            "Weather AI API is running",

        "version":
            "1.0.0",

        "status":
            "success",

        "models":
            "Pre-trained models loaded",

        "training":
            "Disabled during API requests"
    }


# =========================================================
# 14. WEATHER API
# =========================================================

@app.get("/weather/{city}")
def weather(
    city: str
):

    try:

        result = analyze_weather(
            city
        )

        return result

    except HTTPException:

        raise

    except Exception as e:

        raise HTTPException(

            status_code=400,

            detail=str(e)
        )


# =========================================================
# 15. SERVER INFORMATION
# =========================================================

print(
    "API KEY LOADED:",
    bool(API_KEY)
)

print(
    "API KEY LENGTH:",
    len(API_KEY)
    if API_KEY
    else 0
)

print(
    "MODEL DIRECTORY:",
    MODEL_DIR
)

print(
    "RAIN MODEL:",
    RAIN_MODEL_PATH
)

print(
    "TEMP MODEL:",
    TEMP_MODEL_PATH
)

print(
    "HUMIDITY MODEL:",
    HUMIDITY_MODEL_PATH
)

print(
    "ENCODERS:",
    ENCODERS_PATH
)

print(
    "\nWeather AI API is ready."
)