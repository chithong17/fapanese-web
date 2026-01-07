# ===========================
# Stage 1: Build Java app
# ===========================
FROM maven:3.9.8-eclipse-temurin-21 AS build

WORKDIR /app

# Copy dependency definition để cache layer
COPY pom.xml .
# Download dependencies trước (để build nhanh hơn lần sau)
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests

# ===========================
# Stage 2: Runtime image
# ===========================
# Sử dụng base image Java 21 trên nền Ubuntu 22.04 (Jammy)
# Image này đã có sẵn GLIBC 2.35 (khắc phục lỗi GLIBC_2.29 not found)
FROM eclipse-temurin:21-jre-jammy

# Cài đặt các thư viện BẮT BUỘC cho Azure Speech SDK và FFmpeg
# - libasound2: Thư viện âm thanh (Azure SDK bắt buộc cần cái này mới load được)
# - libssl-dev & ca-certificates: Kết nối bảo mật tới Azure
# - ffmpeg: Để code convert audio của bạn chạy được
RUN apt-get update && apt-get install -y \
    libasound2 \
    libssl-dev \
    ca-certificates \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy file jar từ bước build
COPY --from=build /app/target/*.jar app.jar

# Tạo thư mục temp nếu cần (optional, Java tự tạo trong /tmp)
VOLUME /tmp

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]