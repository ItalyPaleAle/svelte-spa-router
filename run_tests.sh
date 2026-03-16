#!/bin/bash
set -e

# Add common Docker paths for macOS
export PATH="/Applications/Docker.app/Contents/Resources/bin:/usr/local/bin:/opt/homebrew/bin:$PATH"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Container names
NGINX_CONTAINER="svelte-spa-router-nginx"
SELENIUM_CONTAINER="svelte-spa-router-selenium"

# Detect architecture and set appropriate images
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
    echo -e "${YELLOW}Detected Apple Silicon (ARM64), using ARM-compatible images${NC}"
    NGINX_IMAGE="arm64v8/nginx:1.19"
    SELENIUM_IMAGE="seleniarm/standalone-chromium:latest"
else
    echo -e "${YELLOW}Detected x86_64, using standard images${NC}"
    NGINX_IMAGE="nginx:1.19"
    SELENIUM_IMAGE="selenium/standalone-chrome:119.0"
fi

cleanup() {
    echo -e "${YELLOW}Cleaning up containers...${NC}"
    docker stop "$NGINX_CONTAINER" "$SELENIUM_CONTAINER" 2>/dev/null || true
    docker rm "$NGINX_CONTAINER" "$SELENIUM_CONTAINER" 2>/dev/null || true
    echo -e "${GREEN}Cleanup complete${NC}"
}

# Always cleanup on exit
trap cleanup EXIT

# Cleanup any existing containers first
cleanup

echo -e "${YELLOW}Running linter (auto-fix + fail on warnings)...${NC}"
npm run eslint -- --fix --max-warnings 0

echo -e "${YELLOW}Building test app...${NC}"
npm run build-test-app

echo -e "${YELLOW}Starting nginx container...${NC}"
docker run \
    -d \
    --name "$NGINX_CONTAINER" \
    -v "$(pwd)/test/app/dist:/usr/share/nginx/html:ro" \
    "$NGINX_IMAGE"

echo -e "${YELLOW}Starting selenium container...${NC}"
docker run \
    -d \
    --name "$SELENIUM_CONTAINER" \
    -p 4444:4444 \
    --link "$NGINX_CONTAINER":nginx \
    --shm-size=2g \
    "$SELENIUM_IMAGE"

echo -e "${YELLOW}Waiting for Selenium to be ready...${NC}"
for i in {1..30}; do
    if curl -s http://127.0.0.1:4444/status | grep -q '"ready": *true'; then
        echo -e "${GREEN}Selenium is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}Timeout waiting for Selenium${NC}"
        exit 1
    fi
    sleep 1
done

echo -e "${YELLOW}Running tests...${NC}"
SELENIUM_HOST=127.0.0.1 \
SELENIUM_PORT=4444 \
LAUNCH_URL=http://nginx \
npm run test

echo -e "${GREEN}Tests completed successfully!${NC}"
