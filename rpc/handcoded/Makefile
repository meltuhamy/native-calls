CODE_DIR = src

.PHONY: project_code

project_code:
	$(MAKE) -C $(CODE_DIR)

clean:
	$(MAKE) -C $(CODE_DIR) clean

test: project_code
	npm install
	./node_modules/karma/bin/karma start --single-run