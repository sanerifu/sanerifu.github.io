lua := $(shell command -v luajit 2>/dev/null || echo lua)
converter := esbeg.lua
dir := posts/
template := $(dir)template.html
index_name := $(dir)index.index

sources := $(sort $(wildcard $(dir)*/index.md))
to_be_compiled_sources := $(sources) index.md about/index.md
to_be_compiled := $(to_be_compiled_sources:%.md=%.index)
outputs := $(sources:%.md=%.html)
indices := $(sources:%.md=%.index)
feeds := $(sources:%.md=%.rss)

all: $(dir)index.html $(to_be_compiled)

$(template): menubar.html

$(dir)index.html: $(index_name) $(indices) 
	@echo MERGING
	@echo "local args = {...} local template_file = io.open(args[1], 'r') args[1] = template_file:read('*a') template_file:close() for i=2,#args do local file = io.open(args[i], 'r') args[i] = file:read('*a') file:close() end io.write((args[1]:gsub('%@POSTDATA%@', table.concat(args, string.char(10, 13), 2)):gsub('%@POSTCOUNT%@', tostring(#args - 1))))" | $(lua) - $(index_name) $(indices) > $@
	@echo "local args = {...} for i=1,#args do local file = io.open(args[i], 'r') args[i] = file:read('*a'):gsub('[' .. string.char(10, 13) .. ']', '@NEWLINE@') file:close() end io.write((([[<?xml version=\"1.0\" encoding=\"UTF-8\" ?>@NEWLINE@<rss version=\"2.0\">@NEWLINE@<channel>@NEWLINE@    <title>Sanerifu</title>@NEWLINE@    <description>Elif Sanem'in A]] .. string.char(0xC4, 0x9F) .. [[ Sayfas]] .. string.char(0xC4, 0xB1) .. [[</description>@NEWLINE@    <link>https://sanerifu.github.io</link>@NEWLINE@    <ttl>1800</ttl>@NEWLINE@@NEWLINE@]] .. table.concat(args, [[@NEWLINE@]]) .. [[@NEWLINE@@NEWLINE@</channel>@NEWLINE@</rss>@NEWLINE@]]):gsub(\"@NEWLINE@\", string.char(10))))" | $(lua) - $(feeds) > rss.xml

%.index: %.md $(template) $(converter)
	@echo COMPILING $<
	@$(lua) $(converter) $< $(patsubst %.md,%.html,$<) $(template) $(patsubst %.md,%.rss,$<) > $@
