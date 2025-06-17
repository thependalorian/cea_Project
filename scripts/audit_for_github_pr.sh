#!/bin/bash

# GitHub PR Validation Script for Climate Economy Assistant
# Following rule #23: Efficient communication and validation

echo "🔍 Running Fullstack Integrity Audit for GitHub PR..."
echo "=================================================="

# Run the production validation
python scripts/production_validation.py > validation.log 2>&1
validation_exit_code=$?

# Check if validation passed
if grep -q "❌" validation.log; then
  echo "❌ BLOCKED: Validation failed. Fix required before merge."
  echo ""
  echo "📋 VALIDATION RESULTS:"
  cat validation.log
  echo ""
  echo "🚫 PR MERGE BLOCKED - Fix critical issues before proceeding"
  exit 1
else
  echo "✅ All validations passed. Safe to merge and deploy."
  echo ""
  echo "📊 VALIDATION SUMMARY:"
  grep -A 20 "PRODUCTION VALIDATION SUMMARY" validation.log
  echo ""
  echo "🚀 PR APPROVED FOR MERGE"
  exit 0
fi 