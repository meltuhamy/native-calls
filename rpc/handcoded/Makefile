CODE_DIR = src
all: .PHONY

.PHONY: project_code

project_code:
	$(MAKE) -C $(CODE_DIR)

clean:
	$(MAKE) -C $(CODE_DIR) clean

test: project_code
	npm install
	npm test