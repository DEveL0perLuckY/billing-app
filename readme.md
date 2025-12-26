git add .
git commit -m "all done"
git push -u origin main

npx expo run:android
npx expo run:ios

git add .
git commit -m "version2.5"
git push


cd android
./gradlew clean
./gradlew signingReport
./gradlew assembleRelease --no-daemon

./gradlew bundleRelease //abb


adb devices
npx expo run:android

git merge --no-commit --no-ff origin/development-baseline

rm -rf ios/Pods
rm -rf ios/Podfile.lock
rm -rf ios/build
rm -rf Pods Podfile.lock
watchman watch-del-all
rm -rf node_modules
rm -rf package-lock.json
npm install
bundle install
cd ios
bundle exec pod install
pod install
cd ..
npx expo run:ios

cd ios
pod deintegrate
pod install
cd ..

always open with white icon not with blue
