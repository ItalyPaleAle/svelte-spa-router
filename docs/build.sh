#!/bin/sh

set -e

GO_VERSION="1.26.2"

ensure_go() {
    if command -v go >/dev/null 2>&1; then
        return 0
    fi

    os="$(uname -s | tr '[:upper:]' '[:lower:]')"
    arch="$(uname -m)"

    case "$arch" in
        x86_64|amd64)
            arch="amd64"
            ;;
        arm64|aarch64)
            arch="arm64"
            ;;
        *)
            echo "Unsupported architecture for Go bootstrap: $arch" >&2
            exit 1
            ;;
    esac

    install_dir="$PWD/.cache/go-toolchain/go${GO_VERSION}"
    go_bin="$install_dir/go/bin/go"

    if [ ! -x "$go_bin" ]; then
        archive="go${GO_VERSION}.${os}-${arch}.tar.gz"
        url="https://go.dev/dl/$archive"
        tmp_dir="$PWD/.cache/go-toolchain/tmp"

        echo "\033[0;1mInstalling Go $GO_VERSION for Hugo modules\033[0;0m"
        rm -rf "$tmp_dir" "$install_dir"
        mkdir -p "$tmp_dir" "$install_dir"
        curl -fsSL "$url" -o "$tmp_dir/$archive"
        tar -C "$install_dir" -xzf "$tmp_dir/$archive"
        rm -rf "$tmp_dir"
    fi

    export PATH="$install_dir/go/bin:$PATH"
}

echo "\033[0;1mBuilding for environment: \033[0;1;35mproduction\033[0;0m"

export GOCACHE="$PWD/.cache/go-build"

ensure_go

echo "\033[0;1mGo version\033[0;0m"
go version

go run github.com/italypaleale/hugo-assets/cmd/vercel-docs-build
