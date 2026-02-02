# Use Java 17
FROM eclipse-temurin:17-jdk-jammy

# Set working directory
WORKDIR /app

# Copy everything
COPY . .

# Build the project (skip tests)
RUN ./mvnw clean package -DskipTests

# Expose port (Render will assign dynamic port)
EXPOSE 8080

# Start the app
CMD ["java", "-jar", "target/Chat-bot-0.0.1-SNAPSHOT.jar"]
