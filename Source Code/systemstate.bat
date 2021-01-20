@ECHO OFF

TITLE Systemstate Server

SET "DEBUG=0"

FOR %%A IN (%*) DO (
	IF "%%A"=="--debug" (
		SET "DEBUG=1"
		START "Systemstate Server" php\php.exe server\launcher.php %*
	)
)

IF %DEBUG%==0 (
	php\php.exe server\launcher.php %*
)

EXIT