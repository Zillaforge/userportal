#!/bin/sh
git checkout src/constants/Version.ts
echo "=== sync code ==="
git pull -r --autostash
echo "=== stash code ==="
git stash
# Modify Version
VERSION_FILE=src/constants/Version.ts
OLD_VERSION=$(awk -F"[.'\"]" '/verNo:/ {print $4}' $VERSION_FILE)
echo "OLD: $OLD_VERSION"
NEW_VERSION=$(date -u -d @$(((($(date +%s)/1800)*1800)+1800+(8*3600))) +"%y%m%d%H%M" | cut -c2-)
echo "NEW: $NEW_VERSION"
sed -i "s/$OLD_VERSION/$NEW_VERSION/g" $VERSION_FILE
git add $VERSION_FILE
git commit -m"Update version 1.0.${NEW_VERSION}"
git push origin master:master-update-version --force -o merge_request.create -o merge_request.target=master
git stash pop
