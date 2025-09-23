# Build stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build
# Copy only pom first to leverage dependency cache
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline

# Then copy sources and build
COPY src ./src
ARG MAVEN_OPTS="-Dmaven.wagon.httpconnectionManager.ttl=60 -Dmaven.wagon.http.retryHandler.count=3"
RUN mvn -q -DskipTests clean package

# Runtime stage
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /build/target/*-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=docker"]
