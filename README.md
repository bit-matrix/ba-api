# Install

create an .env file

# Run

docker build -t ba-api --build-arg API_INTERNAL_DATA_DIR=data_dir .
docker run -d -p 8000:9901 --env-file ./.env ba-api
