.PHONY: install build test run amazon shopify

install:
	npm install

build:
	npm run build

test:
	npm test

run:
	npm run etl.run -- $(SRC)

amazon:
	npm run etl.run -- amazon

shopify:
	npm run etl.run -- shopify
