#!/bin/bash

# XFlows Integration Tests Runner
# This script runs all integration tests to verify flow and plugin functionality

set -e

echo "🧪 Running XFlows Integration Tests"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm is not installed. Please install pnpm first."
    exit 1
fi

print_status "Installing dependencies..."
pnpm install

print_status "Building packages..."
pnpm build

print_status "Running unit tests..."
pnpm test

print_status "Running integration tests..."

# Run core integration tests
print_status "Running FlowOrchestrator + Plugin integration tests..."
pnpm --filter @xflows/core test integration

# Run React demo integration tests
print_status "Running React demo integration tests..."
pnpm --filter @xflows/react-demo test integration

# Run end-to-end integration tests
print_status "Running end-to-end integration tests..."
pnpm --filter @xflows/core test e2e-integration

print_success "All integration tests completed successfully!"
echo ""
echo "📊 Test Summary:"
echo "✅ FlowOrchestrator + Plugin integration"
echo "✅ React component integration"
echo "✅ End-to-end flow testing"
echo "✅ HTTP plugin functionality"
echo "✅ Error handling scenarios"
echo ""
echo "🎉 XFlows is ready for production use!"
