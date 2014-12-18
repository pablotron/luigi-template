SOURCES=$(shell find . -type f -name \*.java)
OUT=luigi-template.jar

all: $(SOURCES)
	javac $(SOURCES)

$(OUT): all
	jar cf $(OUT) pablotron

jar: $(OUT)

clean:
	find . -type f -name \*.class -exec rm -f '{}' ';'
	rm -f $(OUT)
