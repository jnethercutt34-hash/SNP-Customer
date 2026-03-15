#!/usr/bin/env bash
# ─── SNP-Customer Sanitization Audit ──────────────────────────────────────────
# Checks all source files for leaked internal details that should NOT appear
# in the customer-facing tool.
#
# Usage: bash scripts/sanitization-check.sh
# Exit code: 0 = clean, 1 = violations found

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "═══════════════════════════════════════════════════════"
echo " SNP-Customer Sanitization Audit"
echo "═══════════════════════════════════════════════════════"
echo ""

VIOLATIONS=0
SEARCH_DIR="src/"

# ── Vendor Part Numbers ──────────────────────────────────────────────────────
VENDOR_PNS=(
  "VSC8504"
  "VM1502"
  "Virtium"
  "Microchip"
  "Marvell"
  "Xilinx"
  "Lattice"
  "TI-TPS"
  "LTC3"
  "ADP5"
)

echo -e "${YELLOW}Checking vendor part numbers...${NC}"
for pn in "${VENDOR_PNS[@]}"; do
  MATCHES=$(grep -rn --include='*.ts' --include='*.tsx' "$pn" "$SEARCH_DIR" 2>/dev/null || true)
  if [ -n "$MATCHES" ]; then
    echo -e "  ${RED}✗ Found '$pn':${NC}"
    echo "$MATCHES" | sed 's/^/    /'
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
done

# ── Customer Names ───────────────────────────────────────────────────────────
CUSTOMER_NAMES=(
  "customer-a-pleo"
  "customer-b-pleo"
  "customer-c-pleo"
  "fms-irad"
  "customerName.*ABE"
  "customerName.*J2"
  "customerName.*JL"
  "customerName.*FMS"
)

echo -e "${YELLOW}Checking customer names...${NC}"
for name in "${CUSTOMER_NAMES[@]}"; do
  MATCHES=$(grep -rn --include='*.ts' --include='*.tsx' "$name" "$SEARCH_DIR" 2>/dev/null || true)
  if [ -n "$MATCHES" ]; then
    echo -e "  ${RED}✗ Found $name:${NC}"
    echo "$MATCHES" | sed 's/^/    /'
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
done

# ── Internal Document Numbers ────────────────────────────────────────────────
INTERNAL_DOCS=(
  "SNP-HW-"
  "SNP-ICD-"
  "SNP-IDD-"
  "SNP-SUM-"
  "ECO-"
  "ECN-"
  "DCN-"
)

echo -e "${YELLOW}Checking internal document numbers...${NC}"
for doc in "${INTERNAL_DOCS[@]}"; do
  MATCHES=$(grep -rn --include='*.ts' --include='*.tsx' "$doc" "$SEARCH_DIR" 2>/dev/null || true)
  if [ -n "$MATCHES" ]; then
    echo -e "  ${RED}✗ Found '$doc':${NC}"
    echo "$MATCHES" | sed 's/^/    /'
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
done

# ── Internal Fault Codes ─────────────────────────────────────────────────────
echo -e "${YELLOW}Checking internal fault codes...${NC}"
MATCHES=$(grep -rn --include='*.ts' --include='*.tsx' 'ERR_0x' "$SEARCH_DIR" 2>/dev/null || true)
if [ -n "$MATCHES" ]; then
  echo -e "  ${RED}✗ Found internal fault codes:${NC}"
  echo "$MATCHES" | sed 's/^/    /'
  VIOLATIONS=$((VIOLATIONS + 1))
fi

# ── Internal Manual References ───────────────────────────────────────────────
echo -e "${YELLOW}Checking manual section references (ICD/IDD/SUM Sec)...${NC}"
MATCHES=$(grep -rn --include='*.ts' --include='*.tsx' -E '(ICD|IDD|SUM) - Sec' "$SEARCH_DIR" 2>/dev/null || true)
if [ -n "$MATCHES" ]; then
  echo -e "  ${RED}✗ Found internal manual references:${NC}"
  echo "$MATCHES" | sed 's/^/    /'
  VIOLATIONS=$((VIOLATIONS + 1))
fi

# ── GDMS-specific Environment Variables ──────────────────────────────────────
echo -e "${YELLOW}Checking for GDMS-specific references...${NC}"
MATCHES=$(grep -rn --include='*.ts' --include='*.tsx' 'GDMS' "$SEARCH_DIR" 2>/dev/null || true)
if [ -n "$MATCHES" ]; then
  echo -e "  ${RED}✗ Found GDMS references:${NC}"
  echo "$MATCHES" | sed 's/^/    /'
  VIOLATIONS=$((VIOLATIONS + 1))
fi

# ── Results ──────────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════"
if [ $VIOLATIONS -eq 0 ]; then
  echo -e "  ${GREEN}✓ CLEAN — No sanitization violations found.${NC}"
  echo "═══════════════════════════════════════════════════════"
  exit 0
else
  echo -e "  ${RED}✗ FAILED — $VIOLATIONS violation(s) found.${NC}"
  echo -e "  ${RED}  Fix before customer demo!${NC}"
  echo "═══════════════════════════════════════════════════════"
  exit 1
fi
