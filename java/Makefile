SOURCES=$(shell find . -type f -name \*.java)
CLASSES=$(shell find . -type f -name \*.class)
OUT=luigi-template.jar

all: $(SOURCES)
	javac $(SOURCES)

$(OUT): all
	jar cvf $(OUT) $(CLASSES)

jar: $(OUT)

clean:
	rm -v $(OUT) $(CLASSES)
