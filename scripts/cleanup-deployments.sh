#!/usr/bin/env bash
# Cleanup old GitHub Deployments
# Requires: gh CLI authenticated with repo access
# Usage: ./cleanup-deployments.sh [--keep N] [--dry-run]
#
# Environment variables:
#   GITHUB_REPOSITORY - owner/repo (required in CI, auto-detected locally)
#   KEEP_DEPLOYMENTS - number of deployments to keep (default: 10)

set -euo pipefail

KEEP=${KEEP_DEPLOYMENTS:-10}
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --keep)
      KEEP="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

if [[ -z "${GITHUB_REPOSITORY:-}" ]]; then
  GITHUB_REPOSITORY=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")
fi

if [[ -z "$GITHUB_REPOSITORY" ]]; then
  echo "Error: GITHUB_REPOSITORY is not set and could not be detected."
  exit 1
fi

echo "Repository: $GITHUB_REPOSITORY"
echo "Keeping last $KEEP deployments"
echo "Dry run: $DRY_RUN"
echo ""

# Fetch all deployments sorted by created_at descending
DEPLOYMENTS=$(gh api "/repos/${GITHUB_REPOSITORY}/deployments?per_page=100" --jq '.[].id')

if [[ -z "$DEPLOYMENTS" ]]; then
  echo "No deployments found."
  exit 0
fi

COUNT=0
TO_DELETE=()

while IFS= read -r deployment_id; do
  COUNT=$((COUNT + 1))
  if [[ $COUNT -le $KEEP ]]; then
    echo "Keeping deployment $deployment_id (position: $COUNT)"
  else
    TO_DELETE+=("$deployment_id")
  fi
done <<< "$DEPLOYMENTS"

if [[ ${#TO_DELETE[@]} -eq 0 ]]; then
  echo ""
  echo "No deployments to delete."
  exit 0
fi

echo ""
echo "Deployments to delete: ${#TO_DELETE[@]}"
echo ""

for deployment_id in "${TO_DELETE[@]}"; do
  echo "Processing deployment $deployment_id..."
  
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "  [DRY RUN] Would set deployment $deployment_id status to inactive"
    echo "  [DRY RUN] Would delete deployment $deployment_id"
  else
    # Set deployment status to inactive (required before deletion)
    gh api --method POST "/repos/${GITHUB_REPOSITORY}/deployments/${deployment_id}/statuses" \
      -f state=inactive \
      --silent || echo "  Warning: Could not set status to inactive"
    
    # Delete the deployment
    gh api --method DELETE "/repos/${GITHUB_REPOSITORY}/deployments/${deployment_id}" \
      --silent && echo "  Deleted deployment $deployment_id" || echo "  Warning: Could not delete deployment $deployment_id"
  fi
done

echo ""
echo "Cleanup complete."
