all: pm.min.js pm.css

.PHONY: all inline clean server

pm.css: pm.less
	lessc --clean-css="--s1" pm.less pm.css

pm.min.js: cryptolib.js tmpl.js pm.js
	java -jar ~/bin/closure-compiler.jar --language_in ECMASCRIPT_2017 --language_out ECMASCRIPT_2017 --compilation_level ADVANCED_OPTIMIZATIONS --js '**.js' --js '!**.min.js' --js_output_file pm.min.js

inline: all
	inliner main.html > main-all.html

clean:
	rm -f main-all.html pm.min.js pm.css

server:
	python -m SimpleHTTPServer
