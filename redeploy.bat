rmdir --ignore-fail-on-non-empty build
git add .
git commit --allow-empty-message -m ""
pause
git add .
git commit --allow-empty-message -m ""
git push
