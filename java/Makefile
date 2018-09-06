SOURCES=$(shell find src/main/java -type f -name \*.java)
OUT=$(shell pwd)/luigi-template.jar

all: $(SOURCES)
	javac $(SOURCES)

$(OUT): all
	cd src/main/java && jar cf $(OUT) org

jar: $(OUT)

clean:
	find src/main/java -type f -name \*.class -exec rm -f '{}' ';'
	rm -f $(OUT)
