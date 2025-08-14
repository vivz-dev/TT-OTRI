# ---------- RUNTIME ----------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

# Dependencias que usa el clidriver (Debian/Ubuntu)
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    tar \
    libxml2 \
    libstdc++6 \
    libkrb5-3 \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Descargar y desplegar IBM ODBC/CLI driver (clidriver) para linux x64
# Fuente pública de IBM:
# https://public.dhe.ibm.com/ibmdl/export/pub/software/data/db2/drivers/odbc_cli/
ENV IBM_DB_HOME=/opt/ibm/clidriver
ENV LD_LIBRARY_PATH=$IBM_DB_HOME/lib
ENV PATH=$PATH:$IBM_DB_HOME/bin

RUN mkdir -p /opt/ibm && \
    curl -L -o /tmp/clidriver.tgz \
      https://public.dhe.ibm.com/ibmdl/export/pub/software/data/db2/drivers/odbc_cli/linuxx64_odbc_cli.tar.gz && \
    tar -xzf /tmp/clidriver.tgz -C /opt/ibm && \
    rm -f /tmp/clidriver.tgz && \
    test -f /opt/ibm/clidriver/lib/libdb2.so

# ---------- BUILD ----------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY TT-OTRI.csproj ./
RUN dotnet nuget locals all --clear
RUN dotnet restore TT-OTRI.csproj

COPY . .
RUN dotnet publish TT-OTRI.csproj -r linux-x64 -c Release -o /app/out --no-restore

# ---------- FINAL ----------
FROM base AS final
WORKDIR /app
COPY --from=build /app/out .
ENTRYPOINT ["dotnet", "TT-OTRI.dll"]
