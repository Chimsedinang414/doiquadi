FROM eclipse-temurin:17-jdk-jammy AS build

WORKDIR /workspace

COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw \
    && ./mvnw -B -DskipTests dependency:go-offline

COPY src src
RUN ./mvnw -B -DskipTests clean package

FROM eclipse-temurin:17-jre-jammy AS runtime

WORKDIR /app

RUN groupadd --system localfood \
    && useradd --system --gid localfood --home-dir /app localfood

COPY --from=build --chown=localfood:localfood \
    /workspace/target/localfood-backend-1.0.0.jar /app/app.jar

USER localfood

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
