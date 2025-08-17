# ============================
#           BUILD
# ============================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiamos solución y proyecto (único)
COPY TT-OTRI.sln ./
COPY TT-OTRI.csproj ./

# Restore (aprovecha caché)
RUN dotnet nuget locals all --clear
RUN dotnet restore TT-OTRI.csproj

# Copiamos TODO el código y publicamos
COPY . .
RUN dotnet publish TT-OTRI.csproj -c Release -o /app/publish --no-restore

# ============================
#          RUNTIME
# ============================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV DOTNET_RUNNING_IN_CONTAINER=true

# Dependencias del IBM DB2 CLI (Debian/Ubuntu)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl tar libxml2 libstdc++6 libkrb5-3 openssl \
    && rm -rf /var/lib/apt/lists/*

# ----------------------------
# IBM ODBC/CLI driver (con reintentos)
# ----------------------------
ENV IBM_DB_HOME=/opt/ibm/clidriver
ENV LD_LIBRARY_PATH=$IBM_DB_HOME/lib
ENV PATH=$PATH:$IBM_DB_HOME/bin
ARG DB2_CLI_URL="https://public.dhe.ibm.com/ibmdl/export/pub/software/data/db2/drivers/odbc_cli/linuxx64_odbc_cli.tar.gz"

RUN set -eux; \
    mkdir -p /opt/ibm; \
    for i in 1 2 3 4 5; do \
        echo "Descargando clidriver intento $i..."; \
        curl -4 -fSL --connect-timeout 30 --max-time 600 \
             --retry 5 --retry-delay 5 --retry-all-errors \
             -o /tmp/clidriver.tgz "$DB2_CLI_URL" && break || sleep 5; \
    done; \
    tar -xzf /tmp/clidriver.tgz -C /opt/ibm; \
    rm -f /tmp/clidriver.tgz; \
    test -f /opt/ibm/clidriver/lib/libdb2.so


# (Opcional) Persistencia de llaves de DataProtection
RUN mkdir -p /app/keys
VOLUME ["/app/keys"]

# Copiamos artefactos publicados
COPY --from=build /app/publish ./

# Ejecutar como usuario no-root
RUN useradd -m -u 1001 dotnet && chown -R dotnet:dotnet /app
USER 1001

# 👉 Tu ensamblado de salida es TT-OTRI.dll (no TT-OTRI.Api.dll)
ENTRYPOINT ["dotnet", "TT-OTRI.dll"]
