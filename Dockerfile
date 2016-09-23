FROM diko316/alnode

EXPOSE 8000

COPY . $PROJECT_ROOT

RUN npm install -d -y


