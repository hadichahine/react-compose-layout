#!/bin/bash

# Exit on error
set -e

# Function to display usage
usage() {
  echo "Usage: $0 [major|minor|patch]"
  echo "  major  - Bump major version (x.0.0)"
  echo "  minor  - Bump minor version (0.x.0)"
  echo "  patch  - Bump patch version (0.0.x)"
  trap - EXIT  # Remove cleanup trap
  exit 1
}

# Function to cleanup and rollback changes
cleanup() {
  local exit_code=$?

  echo
  if [ $exit_code -ne 0 ]; then
    echo "❌ Error occurred during release process. Rolling back changes..."
    
    # Delete local tag if it exists
    if git rev-parse --verify "refs/tags/v$NEW_VERSION" &>/dev/null; then
      echo "Rolling back local tag v$NEW_VERSION..."
      git tag -d "v$NEW_VERSION" &>/dev/null || true
    fi

    # Delete remote tag if it exists
    if git ls-remote --exit-code origin "refs/tags/v$NEW_VERSION" &>/dev/null; then
      echo "Rolling back remote tag v$NEW_VERSION..."
      git push origin --delete "v$NEW_VERSION" &>/dev/null || true
    fi

    # Delete GitHub release if it exists
    if gh release view "v$NEW_VERSION" &>/dev/null; then
      echo "Rolling back GitHub release v$NEW_VERSION..."
      gh release delete "v$NEW_VERSION" -y &>/dev/null || true
    fi

    # Unpublish from npm if version exists
    if npm view "react-compose-layout@$NEW_VERSION" &>/dev/null; then
      echo "Rolling back npm publish..."
      npm unpublish "react-compose-layout@$NEW_VERSION" &>/dev/null || true
    fi

    # Reset package.json changes if they exist
    git checkout package.json &>/dev/null || true

    echo "✔ Rollback complete"
  fi
  exit $exit_code
}

# Set up cleanup trap
trap cleanup EXIT

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
  echo "Error: GitHub CLI (gh) is not installed. Please install it first:"
  echo "  brew install gh    # on macOS"
  echo "  or visit: https://cli.github.com/"
  trap - EXIT  # Remove cleanup trap
  exit 1
fi

# Ensure we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  echo "Error: Not on main branch. Please switch to main branch first."
  exit 1
fi

# Check if argument is provided
if [ $# -ne 1 ]; then
  usage
fi

# Get current version
CURRENT_VERSION=$(npm pkg get version | tr -d '"')
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"

# Calculate new version based on argument
case $1 in
  "major")
    NEW_VERSION="$((MAJOR + 1)).0.0"
    ;;
  "minor")
    NEW_VERSION="$MAJOR.$((MINOR + 1)).0"
    ;;
  "patch")
    NEW_VERSION="$MAJOR.$MINOR.$((PATCH + 1))"
    ;;
  *)
    usage
    ;;
esac

# Get the latest commit hash
COMMIT_HASH=$(git rev-parse HEAD)

echo "Current version: $CURRENT_VERSION"
echo "New version: $NEW_VERSION"
echo "Target commit: ${COMMIT_HASH:0:7}"
echo
echo "This will:"
echo "1. Create git tag v$NEW_VERSION"
echo "2. Publish to npm"
echo "3. Create GitHub release"
echo
read -p "Proceed with release? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Release cancelled"
  exit 1
fi

# Update version in package.json temporarily
echo "Preparing release..."
npm version $NEW_VERSION --no-git-tag-version

# Create tag at the current commit
echo "Creating tag..."
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

# Build the package
echo "Building package..."
npm run clean
npm run build

# Run tests
echo "Running tests..."
npm test

# Push the tag
echo "Pushing tag..."
git push origin "v$NEW_VERSION"

# Publish to npm
echo "Publishing to npm..."
npm publish

# Create GitHub release
echo "Creating GitHub release..."
gh release create "v$NEW_VERSION" \
  --title "v$NEW_VERSION" \
  --notes "Release v$NEW_VERSION" \
  --verify-tag

# Reset package.json changes
git checkout package.json

# Remove cleanup trap as everything succeeded
trap - EXIT

echo "🎉 Successfully released v$NEW_VERSION!"
echo "✨ Published to npm"
echo "🚀 Created GitHub release" 