webpack --mode production

npx terser dist/main.js --compress --mangle --mangle-props keep_quoted -o dist/main.js

node optimize.js

pushd dist/ 
zip -X -r game.zip index.html *.png *.svg *.bmp *.js
popd

# Optimize the zip
if ! [ -x "$(command -v advzip)" ]; then 
  echo 'Error: advancecomp is not installed. Try Homebrew.';
  exit 1;
fi; 
advzip -z -4 -i 60 dist/game.zip

# Measure the zip!
echo $(echo "13312 - $(wc -c < dist/game.zip)" | bc) bytes remain