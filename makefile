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
feeds := $(sources:%.md=%.rss)

all: $(index_name) $(to_be_compiled)

$(template): menubar.html

$(index_name): $(indices) 
	@echo MERGING
	@echo "local args = {...} for i=1,#args do local file = io.open(args[i], 'r') args[i] = file:read('*a'):gsub('[' .. string.char(10, 13) .. ']', '') file:close() end io.write('const __INDEX__ = [' .. table.concat(args, ',') .. ']')" | $(lua) - $^ > $@
	@echo "local args = {...} for i=1,#args do local file = io.open(args[i], 'r') args[i] = file:read('*a'):gsub('[' .. string.char(10, 13) .. ']', '\\\n') file:close() end io.write([[<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n<rss version=\"2.0\">\n<channel>\n    <title>Sanerifu</title>\n    <description>Elif Sanem\'in Ağ Sayfası</description>\n    <link>https://sanerifu.github.io</link>\n    <ttl>1800</ttl>\n\n]] .. table.concat(args, \"\\\n\") .. [[\n\n</channel>\n</rss>\n]])" | $(lua) - $(feeds) > rss.xml

%.json: %.md $(template) $(converter)
	@echo COMPILING $<
	@$(lua) $(converter) $< $(patsubst %.md,%.html,$<) $(template) $(patsubst %.md,%.rss,$<) > $@
