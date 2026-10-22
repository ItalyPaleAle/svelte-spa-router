#!/bin/sh

# Ignored Build Step for the docs project on Vercel
# Set the project's "Ignored Build Step" command to: sh ignore-build.sh
# Vercel skips the build when this exits with 0, and builds when it exits with 1
# The build is skipped only when nothing in the docs folder or in the root go.work changed since the last successful deployment of this branch

# Run from the docs folder, so "." below always means the docs folder
cd "$(dirname "$0")" || exit 1

# Vercel only sets this when an Ignored Build Step is configured, and leaves it empty on a branch's first deployment
base="$VERCEL_GIT_PREVIOUS_SHA"
if [ -z "$base" ]; then
    echo "No previous deployment for this branch: building"
    exit 1
fi

# Redeploying the same commit is intentional (for example, after changing environment variables)
if [ "$base" = "$(git rev-parse HEAD)" ]; then
    echo "Redeploying commit $base: building"
    exit 1
fi

# Vercel makes a shallow clone, so the previous deployment's commit may be missing from the history
if ! git cat-file -e "$base^{commit}" 2>/dev/null; then
    echo "Commit $base of the previous deployment is not in the clone: building"
    exit 1
fi

# git diff exits with 0 when there are no changes, 1 when there are, and higher on errors, which all fall through to building
# ":(top)" resolves go.work from the repository root; repos without a go.work just never match it
if git diff --quiet "$base" HEAD -- . ':(top)go.work'; then
    echo "No changes to the docs or go.work since $base: skipping build"
    exit 0
fi

echo "Docs or go.work changed since $base: building"
exit 1
