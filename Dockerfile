# Eliminar el archivo con conflicto
Remove-Item Dockerfile

# Crear archivo limpio
@"
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src src
RUN ./mvnw package -DskipTests -q -Dmaven.test.skip=true

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
"@ | Out-File -FilePath Dockerfile -Encoding UTF8

# Commit con mensaje de resolución
git add Dockerfile
git commit -m "resolve: clean Dockerfile conflict"
git push origin dev