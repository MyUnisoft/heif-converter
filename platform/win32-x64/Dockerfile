FROM mcr.microsoft.com/windows/servercore:ltsc2022
LABEL maintainer="Nicolas Marteau <nico_mart@hotmail.fr>"

RUN powershell -NoProfile -ExecutionPolicy Bypass -Command \
    "Set-ExecutionPolicy Bypass -Scope Process; \
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; \
    iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))"

RUN choco install -y git visualstudio2019buildtools visualstudio2019-workload-vctools
RUN choco install -y python3

WORKDIR /heif-converter
COPY . .

RUN git clone https://github.com/microsoft/vcpkg.git
RUN .\vcpkg\bootstrap-vcpkg.bat
RUN .\vcpkg\vcpkg install

CMD ["powershell"]
