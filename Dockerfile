# Stage 1: Build
FROM maven:3.9-amazoncorretto-21 AS build
WORKDIR /app

# Copiar pom.xml e baixar dependências (cache layer)
COPY backend/pom.xml .
COPY backend/src ./src

RUN mvn dependency:go-offline -B
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM amazoncorretto:21-alpine
WORKDIR /app

# Instalar curl para debug/healthcheck
RUN apk add --no-cache curl

# Copiar JAR compilado
COPY --from=build /app/target/*.jar app.jar

# Expor porta
EXPOSE 8080

# Executar aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]
