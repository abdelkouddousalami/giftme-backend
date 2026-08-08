# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Cache dependencies separately from source for faster rebuilds.
COPY pom.xml .
RUN mvn -q -B dependency:go-offline

COPY src ./src
RUN mvn -q -B clean package -DskipTests

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

RUN groupadd --system giftme && useradd --system --gid giftme giftme \
    && mkdir -p /app/storage/uploads \
    && chown -R giftme:giftme /app

COPY --from=build /build/target/giftme-api.jar app.jar

USER giftme

ENV SPRING_PROFILES_ACTIVE=docker
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD wget -qO- http://localhost:8080/actuator/health | grep -q '"status":"UP"' || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
