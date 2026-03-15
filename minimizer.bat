@echo off
cls

SET COMP=.\shared\minimizer\NUglifyApp.exe

REM Smeacher Admin

%COMP% "./www/decsoft-cameras/decsoft-cameras.js" -o "./www/decsoft-cameras/decsoft-cameras.min.js" -enc:in "utf-8" -clobber:true

echo Finished!

pause