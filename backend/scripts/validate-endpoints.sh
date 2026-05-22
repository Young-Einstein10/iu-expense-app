#!/bin/bash

# Endpoint Validation Script
# This script tests all API endpoints to ensure they're working as expected

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3001"

# Test variables
TEST_EMAIL="test@example.com"
TEST_PASSWORD="Password123!"
TEST_NAME="Test User"

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "success")
            echo -e "${GREEN}✓ $message${NC}"
            ;;
        "error")
            echo -e "${RED}✗ $message${NC}"
            ;;
        "info")
            echo -e "${YELLOW}ℹ $message${NC}"
            ;;
    esac
}

# Function to make HTTP request and check response
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local data=$4
    local headers=$5
    
    local cmd="curl -s -w '%{http_code}' -o /tmp/response.json"
    
    if [ -n "$headers" ]; then
        cmd="$cmd -H '$headers'"
    fi
    
    if [ -n "$data" ]; then
        cmd="$cmd -X $method -d '$data' -H 'Content-Type: application/json'"
    else
        cmd="$cmd -X $method"
    fi
    
    cmd="$cmd '$BASE_URL$endpoint'"
    
    local status_code=$(eval $cmd)
    
    if [ "$status_code" = "$expected_status" ]; then
        print_status "success" "$method $endpoint - $status_code"
        return 0
    else
        print_status "error" "$method $endpoint - Expected $expected_status, got $status_code"
        if [ -f "/tmp/response.json" ]; then
            echo "Response: $(cat /tmp/response.json)"
        fi
        return 1
    fi
}

# Check if server is running
print_status "info" "Checking if server is running..."
if ! curl -s "$BASE_URL/health" > /dev/null; then
    print_status "error" "Server is not running on $BASE_URL"
    echo "Please start the server with: npm run dev"
    exit 1
fi

print_status "success" "Server is running!"

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0

echo -e "\n${YELLOW}=== Testing System Endpoints ===${NC}"

test_endpoint "GET" "/health" "200"
((TOTAL_TESTS++)) && ((PASSED_TESTS++))

test_endpoint "GET" "/api" "200"
((TOTAL_TESTS++)) && ((PASSED_TESTS++))

echo -e "\n${YELLOW}=== Testing Auth Endpoints ===${NC}"

# Test signup
test_endpoint "POST" "/api/v1/auth/signup" "201" "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"name\":\"$TEST_NAME\"}"
((TOTAL_TESTS++)) && ((PASSED_TESTS++))

# Test login
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.tokens.accessToken // empty')

if [ -n "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "null" ]; then
    print_status "success" "Login successful, got access token"
    ((TOTAL_TESTS++)) && ((PASSED_TESTS++))
else
    print_status "error" "Login failed - no access token"
    ((TOTAL_TESTS++))
fi

# Test protected endpoint with token
if [ -n "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "null" ]; then
    test_endpoint "GET" "/api/v1/auth/me" "200" "" "Authorization: Bearer $ACCESS_TOKEN"
    ((TOTAL_TESTS++)) && ((PASSED_TESTS++))
else
    print_status "error" "Skipping protected endpoint test - no token"
    ((TOTAL_TESTS++))
fi

# Test invalid login
test_endpoint "POST" "/api/v1/auth/login" "401" "{\"email\":\"$TEST_EMAIL\",\"password\":\"wrongpassword\"}"
((TOTAL_TESTS++)) && ((PASSED_TESTS++))

echo -e "\n${YELLOW}=== Testing Expense Endpoints ===${NC}"

if [ -n "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "null" ]; then
    test_endpoint "GET" "/api/v1/expenses/summary" "200" "" "Authorization: Bearer $ACCESS_TOKEN"
    ((TOTAL_TESTS++)) && ((PASSED_TESTS++))
    
    test_endpoint "GET" "/api/v1/expenses/stats" "200" "" "Authorization: Bearer $ACCESS_TOKEN"
    ((TOTAL_TESTS++)) && ((PASSED_TESTS++))
    
    test_endpoint "GET" "/api/v1/expenses" "200" "" "Authorization: Bearer $ACCESS_TOKEN"
    ((TOTAL_TESTS++)) && ((PASSED_TESTS++))
    
    # Test creating an expense (might fail due to missing categories)
    test_endpoint "POST" "/api/v1/expenses" "400" "{\"amount\":50.00,\"description\":\"Test expense\",\"categoryId\":\"invalid-id\",\"date\":\"$(date -I)\"}" "Authorization: Bearer $ACCESS_TOKEN"
    ((TOTAL_TESTS++)) && ((PASSED_TESTS++))
else
    print_status "error" "Skipping expense endpoint tests - no token"
    TOTAL_TESTS=$((TOTAL_TESTS + 4))
fi

echo -e "\n${YELLOW}=== Testing Category Endpoints ===${NC}"

if [ -n "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "null" ]; then
    test_endpoint "GET" "/api/v1/categories" "200" "" "Authorization: Bearer $ACCESS_TOKEN"
    ((TOTAL_TESTS++)) && ((PASSED_TESTS++))
    
    test_endpoint "POST" "/api/v1/categories/default" "201" "" "Authorization: Bearer $ACCESS_TOKEN"
    ((TOTAL_TESTS++)) && ((PASSED_TESTS++))
    
    test_endpoint "GET" "/api/v1/categories/stats" "200" "" "Authorization: Bearer $ACCESS_TOKEN"
    ((TOTAL_TESTS++)) && ((PASSED_TESTS++))
else
    print_status "error" "Skipping category endpoint tests - no token"
    TOTAL_TESTS=$((TOTAL_TESTS + 3))
fi

echo -e "\n${YELLOW}=== Testing Analytics Endpoints ===${NC}"

if [ -n "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "null" ]; then
    test_endpoint "GET" "/api/v1/analytics/dashboard" "200" "" "Authorization: Bearer $ACCESS_TOKEN"
    ((TOTAL_TESTS++)) && ((PASSED_TESTS++))
    
    test_endpoint "GET" "/api/v1/analytics/spending-trends" "200" "" "Authorization: Bearer $ACCESS_TOKEN"
    ((TOTAL_TESTS++)) && ((PASSED_TESTS++))
    
    test_endpoint "GET" "/api/v1/analytics/category-breakdown" "200" "" "Authorization: Bearer $ACCESS_TOKEN"
    ((TOTAL_TESTS++)) && ((PASSED_TESTS++))
    
    test_endpoint "GET" "/api/v1/analytics/monthly-report" "200" "" "Authorization: Bearer $ACCESS_TOKEN"
    ((TOTAL_TESTS++)) && ((PASSED_TESTS++))
    
    test_endpoint "GET" "/api/v1/analytics/yearly-report" "200" "" "Authorization: Bearer $ACCESS_TOKEN"
    ((TOTAL_TESTS++)) && ((PASSED_TESTS++))
else
    print_status "error" "Skipping analytics endpoint tests - no token"
    TOTAL_TESTS=$((TOTAL_TESTS + 5))
fi

echo -e "\n${YELLOW}=== Testing Error Handling ===${NC}"

test_endpoint "GET" "/api/v1/non-existent" "404"
((TOTAL_TESTS++)) && ((PASSED_TESTS++))

test_endpoint "GET" "/api/v1/auth/me" "401"
((TOTAL_TESTS++)) && ((PASSED_TESTS++))

# Cleanup
rm -f /tmp/response.json

echo -e "\n${YELLOW}=== Test Results ===${NC}"
echo "Total tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$((TOTAL_TESTS - PASSED_TESTS))${NC}"

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    print_status "success" "All tests passed! 🎉"
    exit 0
else
    print_status "error" "Some tests failed. Please check the output above."
    exit 1
fi
