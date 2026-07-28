lua := $(shell command -v luajit 2>/dev/null || echo lua)
converter := esbeg.lua
dir := posts/
template := $(dir)template.html
index_name := $(dir)post_index.js

sources := $(wildcard $(dir)*/index.md)
to_be_compiled_sources := $(sources) index.md about/index.md
to_be_compiled := $(to_be_compiled_sources:%.md=%.json)
outputs := $(sources:%.md=%.html)
indices := $(sources:%.md=%.json)

all: $(index_name) $(to_be_compiled)

$(template): menubar.html

$(index_name): $(indices)
	@echo MERGING
	@echo "local args = {...} for i=1,#args do local file = io.open(args[i], 'r') args[i] = file:read('*a'):gsub('[' .. string.char(10, 13) .. ']', '') file:close() end io.write('const __INDEX__ = [' .. table.concat(args, ',') .. ']')" | $(lua) - $^ > $@

%.json: %.md $(template) $(converter)
	@echo COMPILING $<
	@$(lua) $(converter) $< $(patsubst %.md,%.html,$<) $(template) > $@
